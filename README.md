# AVP Gold Nexus

Build a premium, enterprise-grade frontend-only ERP application for “AVP Gold”, a multi-branch precious-metals business dealing with Gold and Silver, including old-gold/old-silver purchases and bank-pledged gold/silver acquisition.

IMPORTANT:

FRONTEND ONLY.

Do NOT build a backend.

Do NOT create real API integrations.

Do NOT implement real banking/payment integrations.

Do NOT implement real KYC verification.

Do NOT implement real gold-testing-machine integrations.

Use realistic mock data and local frontend state wherever required.

All buttons, tables, forms, filters, modals, tabs, workflows and navigation must be functional in the frontend.

Make the architecture ready for future API integration.

Use clean reusable components and realistic enterprise UX.

DESIGN DIRECTION

Create a premium financial/precious-metals ERP interface.

Style:

Professional

Premium

Modern

Clean

Trustworthy

Enterprise SaaS

Desktop-first but responsive

Avoid:

Excessive gradients

Cartoon-style UI

Overly rounded cards

Excessive animations

Cheap-looking gold effects

Generic admin-template appearance

Use:

Sophisticated neutral/light background

Gold accent used carefully

Dark charcoal text

White cards

Subtle borders

Soft shadows

Excellent spacing

Professional typography

Clear hierarchy

Dense but readable data tables

Use Lucide icons.

Create a collapsible left sidebar and a professional top navigation bar.

APPLICATION STRUCTURE

Main navigation:

Dashboard

Customers

KYC

Gold Purchase

Silver Purchase

Bank Pledged Gold

Bank Pledged Silver

Gold & Silver Testing

Gold Rates

Silver Rates

Valuation

Charges & Commission

Customer Settlement

Payments

Inventory

Packets

Vault

Branch Transfers

Branches

Employees

Approvals

Accounting

Reconciliation

Profit & Margin

Reports

Analytics

Notifications

Audit Logs

Settings

Sidebar should support:

Collapse/expand

Active state

Tooltips when collapsed

Section grouping

Notification badges

Search/navigation

GLOBAL HEADER

Top bar:

Global search

Branch selector

Date selector

Notifications

Help

User profile

Role indicator

Global search should search mock records for:

Customer ID

Customer name

Mobile

Transaction ID

Item ID

Bank reference

Packet ID

Employee

DASHBOARD

Create an executive-level dashboard.

Top KPI cards:

Total Transactions

Gold Purchased

Silver Purchased

Total Purchase Value

Bank-Pledged Transactions

Customer Payouts

Charges Collected

Commission

Inventory Value

Expected Margin

Add:

Gold vs Silver purchase chart

Daily transaction chart

Branch performance chart

Purchase value trend

Bank pledged transaction trend

Pending approvals

Pending bank payments

Pending settlements

Inventory alerts

Recent transactions

Dashboard filters:

Today

This Week

This Month

Custom Range

Branch

Metal

Transaction Type

MULTI-BRANCH

AVP Gold operates multiple branches.

Create:

Branch master

Branch list

Add branch modal

Edit branch

Branch details

Branch manager

Branch employees

Branch targets

Branch limits

Branch status

Sample branches:

Hyderabad

Vijayawada

Tirupati

Kurnool

Visakhapatnam

Use realistic sample data.

Branch dashboard:

Customers

Transactions

Gold purchased

Silver purchased

Bank transactions

Customer payouts

Inventory

Pending approvals

Margin

Allow central management to switch branches from the global header.

CUSTOMER MANAGEMENT

Customer list:

Customer ID

Name

Mobile

Branch

KYC status

Total transactions

Total gold

Total silver

Last transaction

Status

Actions

Features:

Search

Filters

Sort

Pagination

Export UI

Add customer

View customer

Edit customer

Customer profile should have tabs:

Overview
KYC
Photos
Gold Transactions
Silver Transactions
Bank Pledged Transactions
Payments
Settlements
Documents
Activity

Customer profile header:

Customer photo

Name

Customer ID

Mobile

KYC status

Branch

Customer status

KYC

Create professional KYC management UI.

KYC statuses:

Pending

Submitted

Verified

Rejected

Show:

Customer

Document type

Document number masked

Submitted date

Verification status

Verified by

Actions

KYC detail page:

Customer photo

ID document preview

Address proof

PAN preview

Verification timeline

Approve

Reject

Request correction

Use mock document previews.

GOLD PURCHASE

Create a complete old-gold purchase workflow.

Step-based frontend:

Step 1: Customer
Step 2: Gold Items
Step 3: Weight
Step 4: Purity
Step 5: Valuation
Step 6: Charges
Step 7: Approval
Step 8: Customer Settlement
Step 9: Payment
Step 10: Inventory

Gold item entry:

Item ID

Item type

Gross weight

Stone weight

Net weight

Purity

Fine gold

Gold rate

Estimated value

Item types:

Ring

Necklace

Chain

Bracelet

Bangle

Earrings

Coin

Other

SILVER PURCHASE

Same professional workflow for Silver.

Silver item fields:

Item ID

Item type

Gross weight

Non-silver weight

Net weight

Purity

Fine silver

Silver rate

Value

BANK-PLEDGED GOLD

Create a dedicated workflow.

Business logic:
A customer has gold pledged with a bank.
AVP Gold settles the applicable bank outstanding amount.
The bank releases the pledged gold.
AVP Gold acquires the gold.
The gold is tested and valued.
AVP Gold deducts applicable charges and commission.
The remaining eligible amount is settled with the customer.

Do NOT call this an auction workflow.

Screens:

Bank pledged transaction list

New pledged transaction

Bank details

Loan details

Outstanding amount

Bank payment

Gold release

Gold receiving

Testing

Final valuation

Charges

Commission

Customer settlement

Payment

Inventory

Transaction status:
Draft
Verification
Approved
Bank Payment Pending
Bank Paid
Gold Release Pending
Gold Received
Testing
Valuation
Settlement Pending
Customer Paid
Inventory
Completed

BANK-PLEDGED SILVER

Create the same workflow for Silver.

Use reusable components so Gold and Silver workflows share the same architecture.

BANK MANAGEMENT

Bank master:

Bank name

Branch

Address

Contact

Reference information

Status

Bank transaction detail:

Customer

Loan reference

Original loan amount

Outstanding amount

Interest

Charges

Total payable to bank

AVP payment

Release status

Documents

GOLD & SILVER TESTING

Create testing dashboard.

Testing list:

Transaction ID

Item ID

Customer

Metal

Weight

Test status

Purity

Appraiser

Date

Action

Testing detail:

Item photos

Weight photo

Testing photo

Testing machine/result photo

Purity result

Retest

Appraiser approval

Statuses:
Pending
Testing
Retest Required
Approved
Rejected

PHOTO MANAGEMENT

Photos are an important part of the AVP Gold ERP.

Every transaction/item should support:

Customer photo
Item front photo
Item back photo
Item side photo
Hallmark photo
Stone/detail photo
Weight-machine photo
Purity-testing photo
Testing-result photo
Bank document photo
Bank payment proof
Gold release document
Gold receiving photo
Packet photo
Seal photo
Settlement document
Customer payment proof

Create a professional media gallery.

Features:

Upload mock UI

Drag/drop

Camera capture UI placeholder

Preview

Zoom

Delete confirmation

Download UI

Category

Uploaded by

Date/time

Photo categories:
Customer
KYC
Item
Weight
Testing
Bank
Payment
Release
Receiving
Packet
Settlement

Display photos inside the related transaction instead of having only one generic gallery.

GOLD & SILVER RATES

Gold rate page:

Current rate

24K

22K

20K

18K

Custom purity

Rate history

Silver:

999

925

Custom purity

Show:

Rate

Effective date

Effective time

Updated by

Status

Create:

Add rate modal

Edit rate

Rate history

Rate comparison

VALUATION

Create a premium valuation workspace.

Show:

Metal
Gross Weight
Non-metal/Stone Weight
Net Weight
Purity
Fine Metal
Applicable Rate
Gross Value
Deductions
Final Value

For bank-pledged transaction:

Gold/Silver Value
minus Bank Outstanding
minus AVP Charges
minus Commission
minus Other Charges
equals Customer Payable

Create a visual calculation breakdown.

CHARGES & COMMISSION

Create configuration screens.

Charges:

Service charge

Processing fee

Testing fee

Bank-related expense

Other charge

Support:

Fixed amount

Percentage

Configurable rule

Commission:

Fixed

Percentage

Employee

Agent/referral if applicable

Show:

Rule

Rate

Effective date

Status

Created by

CUSTOMER SETTLEMENT

Create settlement screen.

Example:

Gold Value: ₹2,00,000
Bank Outstanding: ₹1,20,000
AVP Charges: ₹5,000
Commission: ₹3,000
Other Charges: ₹0
Customer Payable: ₹72,000

Show:

Calculation

Approval status

Payment status

Customer acknowledgement

Settlement document

PAYMENTS

Payment dashboard:

Customer payments

Bank payments

Pending payments

Completed payments

Failed/rejected mock payments

Reconciliation status

Payment details:

Amount

Payment type

Mode

Reference number

Date

Branch

Approved by

Status

INVENTORY

Create a powerful precious-metal inventory system.

Tabs:

Gold

Silver

Packets

Vault

Transfers

Inventory columns:

Item/Packet ID

Source

Metal

Weight

Purity

Fine Metal

Value

Branch

Location

Status

Statuses:
Available
Reserved
In Vault
In Transfer
Processing
Released
Completed

PACKET MANAGEMENT

Packet list:

Packet ID

Metal

Weight

Purity

Items

Branch

Vault

Seal

Status

Packet detail:

QR code placeholder

Packet photo

Seal photo

Contents

Item list

Movement history

VAULT

Create vault dashboard:

Total packets

Gold weight

Silver weight

Total value

Deposits

Withdrawals

Pending movements

Vault transaction:

Deposit

Withdrawal

Transfer

Approval

Custodian

BRANCH TRANSFERS

Create transfer workflow:

Source Branch
Destination Branch
Metal
Packet
Weight
Purity
Reason
Requested By
Approved By
Dispatch
Transit
Received
Verification

Statuses:
Draft
Requested
Approved
Dispatched
In Transit
Received
Verified
Completed

EMPLOYEES

Employee list:

Employee ID

Name

Role

Branch

Region

Mobile

Status

Last login

Employee profile:

Personal details

Role

Permissions

Branch

Activity

Transactions

Approvals

ROLES & PERMISSIONS

Create permission matrix.

Columns:

Module

View

Create

Edit

Delete

Approve

Export

Roles:
Super Admin
Admin
Regional Manager
Branch Manager
Purchase Executive
Appraiser
Finance
Cashier
Inventory Manager
Auditor

APPROVAL CENTER

Create centralized approval inbox.

Cards/tabs:

Purchase approvals

Valuation approvals

Bank payment approvals

Settlement approvals

Inventory transfer approvals

Rate approvals

Each approval should show:

Transaction

Customer

Branch

Amount

Metal

Requested by

Date

Risk/priority

Approve

Reject

View details

ACCOUNTING

Frontend-only accounting dashboard.

Show:

Bank payments

Customer payouts

Charges

Commission

Expenses

Receivables

Payables

Daily closing

Reconciliation

Do not implement real accounting integrations.

RECONCILIATION

Create reconciliation dashboard.

Sections:
Bank
Customer
Inventory
Payments
Branch

Show:

Expected

Actual

Difference

Status

Statuses:
Matched
Mismatch
Pending Review
Resolved

PROFIT & MARGIN

Create analytics page.

Show:

Total metal value

Total bank amount

Customer payouts

Charges

Commission

Expenses

Expected margin

Actual margin

Charts:

Margin trend

Gold vs Silver

Branch margin

Transaction margin

REPORTS

Create professional report center.

Reports:

Customer Report

KYC Report

Gold Purchase Report

Silver Purchase Report

Bank Pledged Report

Bank Payment Report

Settlement Report

Charges Report

Commission Report

Gold Inventory

Silver Inventory

Packet Report

Vault Report

Branch Transfer

Profit & Margin

Employee Performance

Branch Performance

Reconciliation

Audit Report

Every report:

Date filter

Branch filter

Metal filter

Status filter

Search

Export button

Print button

Use mock export interactions.

ANALYTICS

Create advanced analytics:

Daily transaction trend

Gold volume

Silver volume

Gold value

Silver value

Branch comparison

Bank transaction trend

Customer settlement trend

Charges trend

Commission trend

Margin trend

Inventory trend

Use professional charts.

NOTIFICATIONS

Notification center:

Approval requests

Bank payment alerts

Testing alerts

Settlement alerts

Inventory alerts

Transfer alerts

Reconciliation mismatches

AUDIT LOGS

Create searchable audit table:

Date/time

User

Branch

Module

Action

Transaction

Old value

New value

Status

Filters:

User

Branch

Module

Date

Action

SETTINGS

Sections:

Company

Branches

Users

Roles

Metals

Purity

Rates

Charges

Commission

Approval rules

Transaction limits

Notifications

Security

Document settings

IMPORTANT UX REQUIREMENTS

Use:

Data tables with sticky headers

Search

Filters

Sorting

Pagination

Bulk selection

Status badges

Confirmation dialogs

Toast notifications

Empty states

Loading states

Error states

Skeleton loaders

Form validation

Unsaved-change warning

Breadcrumbs

Detail drawers

Modals

Tabs

Stepper workflows

Use realistic Indian currency formatting:
₹1,25,000

Use Indian number formatting:
1,25,000
10,00,000
1,00,00,000

PHOTO-FIRST TRANSACTION EXPERIENCE

For each transaction detail page, create a dedicated evidence section.

Example:

TRANSACTION AVP-000125

Customer
├── Customer Photo
└── KYC

Gold/Silver
├── Item Photos
├── Weight Photo
├── Hallmark Photo
└── Testing Photos

Bank
├── Bank Documents
├── Payment Proof
└── Release Document

Receiving
├── Gold/Silver Received
├── Packet Photo
└── Seal Photo

Settlement
├── Settlement Document
└── Customer Payment Proof

All media should be linked to the correct transaction/item.

RESPONSIVE DESIGN

Primary target:
Desktop ERP

Also support:

Tablet

Laptop

Smaller screens

On mobile/tablet:

Sidebar becomes drawer

Tables become horizontally scrollable or card-based

Forms become single-column

Dashboard cards adapt responsively

DATA

Use realistic mock data for:

5+ branches

50+ customers

100+ transactions

Gold and Silver

Multiple banks

Employees

Inventory

Packets

Payments

Approvals

Reports

Do not use lorem ipsum.

Use realistic Indian names, locations, amounts, transaction IDs and dates.

IMPORTANT FRONTEND-ONLY RULE

Do not build backend functionality.

Do not pretend that:

Payments are actually processed

KYC is actually verified

Banks are actually contacted

Gold testing hardware is actually connected

WhatsApp/SMS is actually sent

Instead, simulate these actions using frontend state and realistic mock responses.

However, the UI and workflows should feel production-ready and be structured so APIs can be connected later.

FINAL QUALITY REQUIREMENT

The application should look like a premium enterprise ERP used by a serious multi-branch precious-metals company, not a basic admin dashboard.

Prioritize:

Excellent information architecture

Clean UX

Financial data clarity

Transaction traceability

Branch-level controls

Gold/Silver inventory visibility

Photo/document evidence

Approval workflows

Professional tables

Strong dashboard

Consistent design system

Reusable components

Frontend-only mock functionality

Build the complete application with all screens, navigation, forms, tables, detail pages, modals, charts and workflows described above.

## Development

Prefer working locally? You need Node.js and npm:

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
