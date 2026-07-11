import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader, CheckCircle, AlertCircle, Send } from "lucide-react";

const Support = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    feedback: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Auto-detect platform
  const getPlatform = () => {
    if (window.__APP_PLATFORM__) return window.__APP_PLATFORM__;
    const metaPlatform = document.querySelector('meta[name="app-platform"]')?.content;
    if (metaPlatform) return metaPlatform;
    return 'learning-vault'; // Default fallback
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const platform = getPlatform();
      const ticketingApiUrl = import.meta.env.VITE_TICKETING_SYSTEM_URL || 'http://localhost:5000';
      
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        subject: formData.subject || 'Support Request',
        feedback: formData.feedback,
        platform,
      };

      const response = await fetch(`${ticketingApiUrl}/api/tickets/my/support/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-platform': platform,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setFormData({
          fullName: "",
          email: "",
          subject: "",
          feedback: "",
        });
      } else {
        setError(data.message || 'Failed to submit support request');
      }
    } catch (err) {
      if (err.message.includes('429')) {
        setError('Too many requests. Please wait 15 minutes before trying again.');
      } else {
        setError('Failed to submit support request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-emerald-900 mb-2">Support Request Submitted</h3>
          <p className="text-emerald-700 mb-4">
            Thank you! Our support team will get back to you within 24-48 hours.
            <br />
            Ticket ID: <span className="font-mono font-semibold">TKT-{Date.now()}</span>
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto" role="main" aria-labelledby="support-heading">
      <div className="bg-white dark:bg-muted rounded-2xl p-8 space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-foreground" id="support-heading">Contact Support</h2>
          <p className="mt-2 text-muted-foreground text-sm">
            We're here to help. Please fill out the form and our team will get back to you soon.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit} aria-label="Support and Feedback Form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name <span aria-hidden="true">*</span></Label>
              <Input
                name="fullName"
                id="fullName"
                placeholder="Your full name"
                value={formData.fullName}
                onChange={handleChange}
                required
                aria-required="true"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email <span aria-hidden="true">*</span></Label>
              <Input
                type="email"
                name="email"
                id="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                aria-required="true"
              />
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              name="subject"
              id="subject"
              placeholder="Brief description of your issue"
              value={formData.subject}
              onChange={handleChange}
            />
          </div>

          {/* Feedback/Message */}
          <div className="space-y-2">
            <Label htmlFor="feedback">Message / Feedback <span aria-hidden="true">*</span></Label>
            <Textarea
              name="feedback"
              id="feedback"
              placeholder="Please describe your issue or feedback in detail..."
              value={formData.feedback}
              onChange={handleChange}
              rows={5}
              required
              aria-required="true"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full"
            aria-live="polite"
            aria-label={loading ? "Sending support message" : "Submit support request"}
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Request
              </>
            )}
          </Button>
        </form>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Platform: <span className="font-semibold text-gray-700">{getPlatform()}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Support;
