'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function SettingsDocs() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.push('/admin/settings')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Settings Documentation</h1>
      </div>

      <Card className="border-dark-100 bg-dark-200 p-6">
        <h2 className="mb-4 text-xl font-medium">Overview</h2>
        <p className="mb-4 text-gray-300">
          The Settings module provides administrators with control over account configuration,
          security settings, notifications, API keys, billing information, and team management. This
          document explains the purpose of each section and the API implementation details for
          developers.
        </p>
      </Card>

      <Card className="border-dark-100 bg-dark-200 p-6">
        <h2 className="mb-4 text-xl font-medium">API Implementation Guidelines</h2>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1" className="border-dark-100">
            <AccordionTrigger className="rounded-md px-4 py-2 hover:bg-dark-100">
              Account Settings API
            </AccordionTrigger>
            <AccordionContent className="px-4 py-2">
              <div className="space-y-4">
                <p>
                  <strong>Endpoint:</strong> <code>/api/settings/account</code>
                </p>
                <p>
                  <strong>Method:</strong> GET
                </p>
                <p>
                  <strong>Purpose:</strong> Retrieve current account settings.
                </p>

                <h3 className="mt-2 font-medium">Response Structure:</h3>
                <pre className="overflow-auto rounded-md bg-dark-100 p-4 text-sm">
                  {`{
  "success": true,
  "data": {
    "name": "Admin User",
    "email": "admin@voiceagent.ai",
    "phone": "+1 (555) 123-4567",
    "language": "English",
    "timezone": "UTC-8 (Pacific Time)",
    "role": "Super Admin",
    "preferences": {
      "darkMode": true,
      "showAnalyticsDashboard": true,
      "emailDigest": false
    }
  }
}`}
                </pre>

                <p>
                  <strong>Endpoint:</strong> <code>/api/settings/account</code>
                </p>
                <p>
                  <strong>Method:</strong> PATCH
                </p>
                <p>
                  <strong>Purpose:</strong> Update account settings.
                </p>

                <h3 className="mt-2 font-medium">Request Body:</h3>
                <pre className="overflow-auto rounded-md bg-dark-100 p-4 text-sm">
                  {`{
  "name": "New Admin Name",  // Optional
  "email": "newemail@voiceagent.ai",  // Optional
  "phone": "+1 (555) 987-6543",  // Optional
  "language": "Spanish",  // Optional
  "timezone": "UTC-5 (Eastern Time)",  // Optional
  "preferences": {  // Optional
    "darkMode": true,
    "showAnalyticsDashboard": false,
    "emailDigest": true
  }
}`}
                </pre>

                <h3 className="mt-2 font-medium">Implementation Notes:</h3>
                <ul className="list-disc space-y-1 pl-5">
                  <li>
                    Validate email format and ensure it's not already in use by another account
                  </li>
                  <li>Implement phone number validation</li>
                  <li>Maintain audit logs of settings changes</li>
                  <li>
                    Consider sending verification emails for critical changes like email updates
                  </li>
                  <li>Implement partial updates to only modify specified fields</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="border-dark-100">
            <AccordionTrigger className="rounded-md px-4 py-2 hover:bg-dark-100">
              Security Settings API
            </AccordionTrigger>
            <AccordionContent className="px-4 py-2">
              <div className="space-y-4">
                <p>
                  <strong>Endpoint:</strong> <code>/api/settings/security/password</code>
                </p>
                <p>
                  <strong>Method:</strong> PUT
                </p>
                <p>
                  <strong>Purpose:</strong> Update user password.
                </p>

                <h3 className="mt-2 font-medium">Request Body:</h3>
                <pre className="overflow-auto rounded-md bg-dark-100 p-4 text-sm">
                  {`{
  "currentPassword": "current-password-here",
  "newPassword": "new-password-here",
  "confirmPassword": "new-password-here"
}`}
                </pre>

                <h3 className="mt-2 font-medium">Response Structure:</h3>
                <pre className="overflow-auto rounded-md bg-dark-100 p-4 text-sm">
                  {`{
  "success": true,
  "message": "Password updated successfully"
}`}
                </pre>

                <p>
                  <strong>Endpoint:</strong> <code>/api/settings/security/two-factor</code>
                </p>
                <p>
                  <strong>Method:</strong> PUT
                </p>
                <p>
                  <strong>Purpose:</strong> Enable or disable two-factor authentication.
                </p>

                <h3 className="mt-2 font-medium">Request Body:</h3>
                <pre className="overflow-auto rounded-md bg-dark-100 p-4 text-sm">
                  {`{
  "enabled": true,
  "method": "app",  // "app" or "sms" or "email"
  "verificationCode": "123456"  // Required when enabling
}`}
                </pre>

                <h3 className="mt-2 font-medium">Implementation Notes:</h3>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Enforce strong password requirements (min length, complexity)</li>
                  <li>Store passwords securely using bcrypt or similar hashing algorithm</li>
                  <li>Implement rate limiting for password change attempts</li>
                  <li>Send notifications via alternative channels for security changes</li>
                  <li>Generate and store backup codes when enabling 2FA</li>
                  <li>Log all security setting changes with IP address and device info</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="border-dark-100">
            <AccordionTrigger className="rounded-md px-4 py-2 hover:bg-dark-100">
              Notification Settings API
            </AccordionTrigger>
            <AccordionContent className="px-4 py-2">
              <div className="space-y-4">
                <p>
                  <strong>Endpoint:</strong> <code>/api/settings/notifications</code>
                </p>
                <p>
                  <strong>Method:</strong> GET
                </p>
                <p>
                  <strong>Purpose:</strong> Retrieve current notification preferences.
                </p>

                <h3 className="mt-2 font-medium">Response Structure:</h3>
                <pre className="overflow-auto rounded-md bg-dark-100 p-4 text-sm">
                  {`{
  "success": true,
  "data": {
    "newCustomerSignup": {
      "email": false,
      "system": true
    },
    "paymentReceived": {
      "email": false,
      "system": true
    },
    "failedPayment": {
      "email": true,
      "system": true
    },
    "highUsageAlert": {
      "email": false,
      "system": true
    }
  }
}`}
                </pre>

                <p>
                  <strong>Endpoint:</strong> <code>/api/settings/notifications</code>
                </p>
                <p>
                  <strong>Method:</strong> PUT
                </p>
                <p>
                  <strong>Purpose:</strong> Update notification preferences.
                </p>

                <h3 className="mt-2 font-medium">Request Body:</h3>
                <pre className="overflow-auto rounded-md bg-dark-100 p-4 text-sm">
                  {`{
  "newCustomerSignup": {
    "email": true,
    "system": true
  },
  "paymentReceived": {
    "email": true,
    "system": false
  }
  // Other notification types are optional and will keep existing settings
}`}
                </pre>

                <h3 className="mt-2 font-medium">Implementation Notes:</h3>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Use a flexible schema to allow adding new notification types</li>
                  <li>Implement default notification settings for new users</li>
                  <li>Consider user roles when determining available notification options</li>
                  <li>
                    Validate email settings to ensure critical notifications can't be disabled
                  </li>
                  <li>Test notification delivery after settings changes</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4" className="border-dark-100">
            <AccordionTrigger className="rounded-md px-4 py-2 hover:bg-dark-100">
              API Keys Management
            </AccordionTrigger>
            <AccordionContent className="px-4 py-2">
              <div className="space-y-4">
                <p>
                  <strong>Endpoint:</strong> <code>/api/settings/api-keys</code>
                </p>
                <p>
                  <strong>Method:</strong> GET
                </p>
                <p>
                  <strong>Purpose:</strong> Retrieve all API keys (redacted).
                </p>

                <h3 className="mt-2 font-medium">Response Structure:</h3>
                <pre className="overflow-auto rounded-md bg-dark-100 p-4 text-sm">
                  {`{
  "success": true,
  "data": {
    "production": {
      "key": "sk_live_xXxX...xXxX",  // Redacted
      "lastUsed": "2025-04-01T10:32:15Z",
      "created": "2024-10-15T08:00:00Z"
    },
    "test": {
      "key": "sk_test_xXxX...xXxX",  // Redacted
      "lastUsed": "2025-04-02T15:45:30Z",
      "created": "2024-10-15T08:00:00Z"
    },
    "webhook": {
      "key": "whsec_xXxX...xXxX",  // Redacted
      "created": "2024-10-15T08:00:00Z"
    }
  }
}`}
                </pre>

                <p>
                  <strong>Endpoint:</strong> <code>/api/settings/api-keys/rotate</code>
                </p>
                <p>
                  <strong>Method:</strong> POST
                </p>
                <p>
                  <strong>Purpose:</strong> Generate new API keys while temporarily maintaining old
                  ones.
                </p>

                <h3 className="mt-2 font-medium">Request Body:</h3>
                <pre className="overflow-auto rounded-md bg-dark-100 p-4 text-sm">
                  {`{
  "type": "production",  // "production", "test", or "webhook"
  "retainOldKeyDays": 7  // How long to keep old key valid, 0-30 days
}`}
                </pre>

                <h3 className="mt-2 font-medium">Response Structure:</h3>
                <pre className="overflow-auto rounded-md bg-dark-100 p-4 text-sm">
                  {`{
  "success": true,
  "data": {
    "newKey": "sk_live_NeWkEyVaLuEhErE",  // Full new key (only shown once)
    "oldKey": "sk_live_xXxX...xXxX",  // Redacted
    "oldKeyValidUntil": "2025-04-10T12:00:00Z"
  }
}`}
                </pre>

                <h3 className="mt-2 font-medium">Implementation Notes:</h3>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Store API keys using secure hashing methods</li>
                  <li>Never return full API keys in responses except immediately after creation</li>
                  <li>Implement key rotation with grace periods to prevent service disruption</li>
                  <li>Log all API key usage with IP address and request information</li>
                  <li>Set up monitoring for unusual API key usage patterns</li>
                  <li>Implement rate limiting and usage quotas per API key</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5" className="border-dark-100">
            <AccordionTrigger className="rounded-md px-4 py-2 hover:bg-dark-100">
              Webhook Management
            </AccordionTrigger>
            <AccordionContent className="px-4 py-2">
              <div className="space-y-4">
                <p>
                  <strong>Endpoint:</strong> <code>/api/settings/webhooks</code>
                </p>
                <p>
                  <strong>Method:</strong> GET
                </p>
                <p>
                  <strong>Purpose:</strong> List all configured webhook endpoints.
                </p>

                <h3 className="mt-2 font-medium">Response Structure:</h3>
                <pre className="overflow-auto rounded-md bg-dark-100 p-4 text-sm">
                  {`{
  "success": true,
  "data": {
    "webhooks": [
      {
        "id": 1,
        "type": "payment",
        "url": "https://api.yourcompany.com/webhooks/payments",
        "status": "active",
        "events": ["payment.created", "payment.completed", "payment.failed"],
        "lastTriggered": "2025-04-01T14:22:33Z",
        "successRate": 98.5
      },
      {
        "id": 2,
        "type": "account",
        "url": "https://api.yourcompany.com/webhooks/accounts",
        "status": "active",
        "events": ["account.created", "account.updated", "account.deleted"],
        "lastTriggered": "2025-03-28T09:15:22Z",
        "successRate": 100
      }
    ]
  }
}`}
                </pre>

                <p>
                  <strong>Endpoint:</strong> <code>/api/settings/webhooks</code>
                </p>
                <p>
                  <strong>Method:</strong> POST
                </p>
                <p>
                  <strong>Purpose:</strong> Create a new webhook endpoint.
                </p>

                <h3 className="mt-2 font-medium">Request Body:</h3>
                <pre className="overflow-auto rounded-md bg-dark-100 p-4 text-sm">
                  {`{
  "type": "usage",
  "url": "https://api.yourcompany.com/webhooks/usage",
  "events": ["usage.threshold.reached", "usage.limit.exceeded"],
  "description": "Monitor usage thresholds",
  "active": true
}`}
                </pre>

                <h3 className="mt-2 font-medium">Implementation Notes:</h3>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Validate webhook URLs to ensure they are properly formatted</li>
                  <li>Implement a test event mechanism to verify webhook configuration</li>
                  <li>Create a retry strategy for failed webhook deliveries</li>
                  <li>Implement webhook event filtering for efficient processing</li>
                  <li>Set up monitoring for webhook delivery success rates</li>
                  <li>Consider implementing webhook signatures for security</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6" className="border-dark-100">
            <AccordionTrigger className="rounded-md px-4 py-2 hover:bg-dark-100">
              Team Management API
            </AccordionTrigger>
            <AccordionContent className="px-4 py-2">
              <div className="space-y-4">
                <p>
                  <strong>Endpoint:</strong> <code>/api/settings/team</code>
                </p>
                <p>
                  <strong>Method:</strong> GET
                </p>
                <p>
                  <strong>Purpose:</strong> List all team members and their roles.
                </p>

                <h3 className="mt-2 font-medium">Response Structure:</h3>
                <pre className="overflow-auto rounded-md bg-dark-100 p-4 text-sm">
                  {`{
  "success": true,
  "data": {
    "members": [
      {
        "id": 1,
        "name": "Admin User",
        "email": "admin@voiceagent.ai",
        "role": "Super Admin",
        "status": "active",
        "lastLogin": "2025-04-03T09:12:45Z",
        "addedOn": "2024-01-15T08:00:00Z"
      },
      {
        "id": 2,
        "name": "Jane Smith",
        "email": "jane@voiceagent.ai",
        "role": "Admin",
        "status": "active",
        "lastLogin": "2025-04-02T14:35:22Z",
        "addedOn": "2024-02-10T10:30:00Z"
      },
      {
        "id": 3,
        "name": "John Doe",
        "email": "john@voiceagent.ai",
        "role": "Support",
        "status": "active",
        "lastLogin": "2025-04-01T16:42:08Z",
        "addedOn": "2024-03-05T11:15:00Z"
      }
    ],
    "roles": [
      {
        "name": "Super Admin",
        "description": "Full access to all settings and operations",
        "permissions": ["*"]
      },
      {
        "name": "Admin",
        "description": "Can manage customers and view analytics",
        "permissions": [
          "customers.view",
          "customers.edit",
          "analytics.view",
          "payments.view",
          "payments.process"
        ]
      },
      {
        "name": "Support",
        "description": "Can view customer data and provide support",
        "permissions": [
          "customers.view",
          "calls.view",
          "support.respond"
        ]
      }
    ]
  }
}`}
                </pre>

                <p>
                  <strong>Endpoint:</strong> <code>/api/settings/team/invite</code>
                </p>
                <p>
                  <strong>Method:</strong> POST
                </p>
                <p>
                  <strong>Purpose:</strong> Invite a new team member.
                </p>

                <h3 className="mt-2 font-medium">Request Body:</h3>
                <pre className="overflow-auto rounded-md bg-dark-100 p-4 text-sm">
                  {`{
  "email": "newmember@example.com",
  "name": "New Member",
  "role": "Support",
  "message": "Looking forward to having you on the team!"
}`}
                </pre>

                <h3 className="mt-2 font-medium">Implementation Notes:</h3>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Implement role-based access control (RBAC) with granular permissions</li>
                  <li>Generate secure, time-limited invitation tokens</li>
                  <li>Send email invitations with clear instructions for joining</li>
                  <li>Maintain audit logs for all team member actions</li>
                  <li>Implement account recovery procedures for administrator access</li>
                  <li>Consider implementing session management and forced logouts</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7" className="border-dark-100">
            <AccordionTrigger className="rounded-md px-4 py-2 hover:bg-dark-100">
              Billing Information API
            </AccordionTrigger>
            <AccordionContent className="px-4 py-2">
              <div className="space-y-4">
                <p>
                  <strong>Endpoint:</strong> <code>/api/settings/billing</code>
                </p>
                <p>
                  <strong>Method:</strong> GET
                </p>
                <p>
                  <strong>Purpose:</strong> Retrieve current billing information.
                </p>

                <h3 className="mt-2 font-medium">Response Structure:</h3>
                <pre className="overflow-auto rounded-md bg-dark-100 p-4 text-sm">
                  {`{
  "success": true,
  "data": {
    "companyName": "VoiceAgent AI Inc.",
    "billingEmail": "billing@voiceagent.ai",
    "address": {
      "line1": "123 AI Street",
      "line2": "Suite 200",
      "city": "San Francisco",
      "state": "CA",
      "postalCode": "94107",
      "country": "US"
    },
    "taxId": "US123456789",
    "paymentMethods": [
      {
        "id": "pm_1234567890",
        "type": "Credit Card",
        "brand": "Visa",
        "last4": "4242",
        "expMonth": 5,
        "expYear": 2025,
        "isDefault": true
      }
    ]
  }
}`}
                </pre>

                <p>
                  <strong>Endpoint:</strong> <code>/api/settings/billing</code>
                </p>
                <p>
                  <strong>Method:</strong> PATCH
                </p>
                <p>
                  <strong>Purpose:</strong> Update billing information.
                </p>

                <h3 className="mt-2 font-medium">Request Body:</h3>
                <pre className="overflow-auto rounded-md bg-dark-100 p-4 text-sm">
                  {`{
  "companyName": "VoiceAgent AI International Inc.",
  "billingEmail": "finance@voiceagent.ai",
  "address": {
    "line1": "456 Technology Boulevard",
    "line2": "Floor 12",
    "city": "San Francisco",
    "state": "CA",
    "postalCode": "94107",
    "country": "US"
  },
  "taxId": "US987654321"
}`}
                </pre>

                <h3 className="mt-2 font-medium">Implementation Notes:</h3>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Validate tax ID formats based on country</li>
                  <li>Implement address validation and normalization</li>
                  <li>Ensure PCI compliance for payment method storage</li>
                  <li>Generate updated invoices with new billing information</li>
                  <li>Notify billing contacts of information changes</li>
                  <li>Support for multiple payment methods with default selection</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>
    </div>
  );
}
