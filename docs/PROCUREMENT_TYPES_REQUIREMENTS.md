# Procurement Types and Loan Tracking — Requirements

## Goal
Support procurement needs that are purchased, borrowed at no cost, or already available as inventory. Keep Finance integration accurate and avoid forcing a fake price for borrowed equipment.

## Types
- `purchase` (Pembelian): supports estimates, actual price, budget category, purchase date, ordered commitment, purchased/ready expense, and the existing one-to-one finance link.
- `borrow` (Peminjaman): records a borrowed item with lender/source and optional planned return date. No estimate/actual price, budget category, purchase date, commitment, or Finance transaction. A borrowed item in status ready means currently in use; Owner can mark it returned, which records `returned_at` and displays returned state.
- `inventory` (Inventaris tersedia): records equipment already available; no purchase price or Finance transaction.

## Data and compatibility
- Add `procurement_type` text with allowed values purchase/borrow/inventory and default purchase.
- Add nullable `expected_return_date` date and `returned_at` timestamptz.
- Existing rows must remain purchase-type so legacy finance links and status meanings remain unchanged.
- Non-purchase items must have null estimate/actual price, category, and purchase date. Non-purchase items cannot use ordered/purchased statuses.
- Items already linked to a Finance transaction cannot be changed to borrow or inventory.
- Finance trigger/upsert must only create/update expenses for purchase type.

## UX and validation
- Add/edit modal includes a type selector.
- Show price/category/purchase-date fields only for purchase. For borrow show optional planned return date. For inventory hide both purchase and return-date fields.
- Supplier/source field label changes to supplier/shop, lender/owner, or inventory source according to type.
- Only purchase type contributes to estimated, commitment, and actual purchase totals and can show Catat ke Keuangan.
- Borrow card displays type, planned return date, current loan/returned status, and a guarded **Tandai dikembalikan** action.
- Server Action validates event ownership and PIC roster as before; return action validates item belongs to Owner group/event and is borrow type in ready status.

## Acceptance criteria
- [ ] Owner can create/edit purchase, borrow, and inventory items.
- [ ] Borrow/inventory can be saved without any price.
- [ ] Borrow/inventory never creates a Finance transaction or commitment.
- [ ] Purchase still requires actual unit price > Rp0 when purchased/ready.
- [ ] Existing records remain purchase-type after migration.
- [ ] Linked purchase cannot be converted to non-purchase type through UI or SQL trigger.
- [ ] Borrow supports optional planned return date and mark-returned action.
- [ ] Returned item is visibly marked and cannot be marked returned twice.
- [ ] Migration is reviewed/applied by Owner; RLS/authorization boundaries remain intact.
- [ ] Local lint/build, browser E2E, Preview, and Owner UAT are recorded.

## Migration state
Migration `20261126_procurement_types_and_loans.sql` is authored in the feature branch only. It has not been applied to Supabase. No production data was changed.
