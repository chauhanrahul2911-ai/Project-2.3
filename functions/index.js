// ============================================================
// 🔔 RAZORPAY WEBHOOK — the real, tamper-proof source of truth.
// ============================================================
// Razorpay's OWN server calls this URL directly the moment a payment is
// captured — completely independent of the customer's browser. So even
// if the browser is closed the instant payment succeeds, this still runs
// and Firestore still gets updated. This is also the ONLY thing now
// allowed to write "isPremium" (see firestore.rules) — a user can no
// longer fake it from the browser console.
//
// See functions/README.md for the full one-time deployment steps.
// ============================================================

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const crypto = require("crypto");

admin.initializeApp();

// Stored via `firebase functions:secrets:set RAZORPAY_WEBHOOK_SECRET`
// (see README) — never hardcoded here, never exposed to the browser.
const RAZORPAY_WEBHOOK_SECRET = defineSecret("RAZORPAY_WEBHOOK_SECRET");

exports.razorpayWebhook = onRequest(
    { secrets: [RAZORPAY_WEBHOOK_SECRET] },
    async (req, res) => {
        try {
            if (req.method !== "POST") {
                res.status(405).send("Method Not Allowed");
                return;
            }

            const signature = req.headers["x-razorpay-signature"];
            if (!signature) {
                res.status(400).send("Missing signature");
                return;
            }

            // The signature MUST be verified against the exact raw bytes Razorpay
            // sent — req.rawBody (a Buffer, provided automatically by Cloud
            // Functions) — NOT a re-serialized JSON.stringify(req.body), which can
            // differ byte-for-byte and would make every signature check fail.
            const expectedSignature = crypto
                .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET.value())
                .update(req.rawBody)
                .digest("hex");

            if (expectedSignature !== signature) {
                console.error("Razorpay webhook: signature mismatch — rejecting request.");
                res.status(400).send("Invalid signature");
                return;
            }

            const event = req.body.event;
            if (event !== "payment.captured") {
                // Some other event type we don't act on — acknowledge with 200 so
                // Razorpay doesn't keep retrying it.
                res.status(200).send("Ignored (not payment.captured)");
                return;
            }

            const payment = req.body.payload && req.body.payload.payment && req.body.payload.payment.entity;
            const uid = payment && payment.notes && payment.notes.firebaseUID;

            if (!uid) {
                console.error("Razorpay webhook: payment.captured with no firebaseUID in notes.", payment && payment.id);
                res.status(400).send("Missing firebaseUID in payment notes");
                return;
            }

            await admin.firestore().collection("users").doc(uid).set(
                {
                    isPremium: true,
                    lastPaymentId: payment.id,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                },
                { merge: true }
            );

            console.log(`Premium unlocked for uid=${uid} via payment=${payment.id}`);
            res.status(200).send("OK");
        } catch (err) {
            console.error("Razorpay webhook error:", err);
            res.status(500).send("Internal error");
        }
    }
);
