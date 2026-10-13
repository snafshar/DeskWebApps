# Error State Guide

For every user-triggered operation, define these states:

1. **Idle:** the action is available.
2. **Loading:** progress is visible and duplicate submission is controlled.
3. **Success:** the result and next action are clear.
4. **Empty:** explain what is missing and how to proceed.
5. **Error:** explain the problem in actionable language without exposing internal details.

Keep state transitions consistent across web and desktop clients.
