# Validation boundaries

Validation belongs at the domain boundary where invalid state first becomes meaningful.

Examples:
- required text must reject blank values;
- numeric ranges must reject values outside the supported domain;
- persistence must distinguish missing data from malformed data;
- presentation code should display domain errors rather than recreate validation rules.
