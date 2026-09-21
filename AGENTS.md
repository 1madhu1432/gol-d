# AVP Gold — Enterprise Precious Metal ERP

## Architecture & Development Guidelines
- **Technology Stack:** Vite, React 19, TypeScript, TanStack Router & TanStack Start, TailwindCSS.
- **Enterprise Modules:** Operations (Counter Gold/Silver Purchases, Bank-Pledged Redemptions, Lab Assaying & Testing), Commercial (Valuation, Rates, Charges & Commission, Settlements, Payouts), Custody (Vaults, Packets, Branch Transfers), Finance (Accounting, Reconciliation, Margin), Administration (Branches, Employees, Roles, Audit Logs).
- **Branch Context:** Strict branch data isolation for Branch Managers, multi-branch oversight for Super Admin and HQ Finance.
- **Strict Terminology:** Bank-pledged metal is NOT an auction. Use: Bank Outstanding, Bank Payment, Bank Release, Customer Settlement.
