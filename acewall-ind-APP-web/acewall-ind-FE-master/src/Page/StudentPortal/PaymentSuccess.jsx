import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { axiosInstance } from "../../lib/AxiosInstance";
import { toast } from "sonner";

export default function PaymentSuccess() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const sessionId = queryParams.get("session_id"); // Get session_id from the URL
        
        if (sessionId) {
            // Call backend to verify the payment and create enrollment
            verifyPayment(sessionId);
        } else {
            setError("Session ID not found in the URL.");
            setLoading(false);
        }
    }, []);

    const verifyPayment = async (sessionId) => {
        try {
            const response = await fetch(`/api/verify-session?session_id=${sessionId}`);
            const data = await response.json();

            if (data.success) {
                // Handle the successful payment: Create Purchase, Enrollment, etc.
                setLoading(false);
            } else {
                setError("Payment verification failed.");
                setLoading(false);
            }
        } catch (err) {
            setError("Error verifying payment: " + err.message);
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h1>Payment Successful!</h1>
            <p>Your payment was successful, and you're now enrolled in the course.</p>
        </div>
    );
};

