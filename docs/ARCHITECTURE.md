## Application boundaries

Keep these concerns separate:

- **Domain:** validation and business rules.
- **Application:** workflows that coordinate domain operations.
- **Persistence:** loading and saving data.
- **Presentation:** desktop/web/mobile UI state.

A UI action should call an application operation rather than duplicate domain rules. This keeps future desktop and web clients consistent.
