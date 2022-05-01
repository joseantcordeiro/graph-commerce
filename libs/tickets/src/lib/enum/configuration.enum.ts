export enum OrganizationDefaultConfig {
  BASE_URL = 'Base application url',
  BASE_PRIVACY_URL = 'Global Privacy Policy URL',
  BASE_TERMS_URL = 'Global Terms And Conditions',
  // Google Analytics
  GOOGLE_ANALYTICS_TRACKING_ID = 'Google Analytics tracking ID',
  GOOGLE_ANALYTICS_NOCOOKIES = 'Run Google Analytics without cookies and scrambling the client IP address (default true)',
  // E-Mail - E-Mail settings
  MAILER_TYPE = 'SMTP | SES | MAILGUN | SENDGRID | DISABLED',
  MAILER_REPLY_TO = 'Reply-to address',
  MAILER_CC = 'Add additional CC when the system send notifications to the event organizer, can insert multiple email (comma separated)',
  MAILER_MANAGED = 'How many e-mail should be managed within 5 sec.',
  MAILER_ATTEMPTS = 'The number of attempts when trying to sending an email (default: 10)',
  MAILER_ENABLE_HTML = 'Enable HTML emails (default: true, if disabled only plain text emails will be sent)',
  MAILER_FOOTER = 'Email footer',
  // MAP - Map settings
  MAPS_PROVIDER = 'Maps = None | Google | OpenStreetMap',
  // Invoice
  VAT_NUMBER = 'VAT_NUMBER',
  INVOICE_NUMBER_PATTERN = 'INVOICE_NUMBER_PATTERN',
  INVOICE_ADDRESS = 'Invoice address',
  INVOICE_PHONE = 'Invoice phone',
  INVOICE_EMAIL = 'Invoice email',
  INVOICE_WEB = 'Invoice web',
  INVOICE_LOGO = 'Invoice logo',
  INVOICE_COMPANY_NAME = 'Invoice company name',
}
