# Home Assistant Inactive Redirect

This is a Lovelace frontend component for Home Assistant that redirects the browser to a specific dashboard page after a configurable period of inactivity.

## Installation

### HACS

1.  Add this repository as a custom repository in HACS.
2.  Search for "Inactive Redirect" and install it.
3.  Add the following to your `ui-lovelace.yaml` or through the raw configuration editor:

    ```
    resources:
      - url: /hacsfiles/inactive-redirect/inactive-redirect.js
        type: module
    ```

## Configuration

To use this component, add a custom card to your dashboard with the following configuration:

    type: custom:inactive-redirect
    timeout: 30 # in seconds
    redirect_path: /lovelace/default_view
    
**Options:**

| Name          | Type    | Required | Description                                       |
|---------------|---------|----------|---------------------------------------------------|
| `type`        | `string`| Yes      | `custom:inactive-redirect`                        |
| `timeout`     | `integer`| No       | The inactivity timeout in seconds. Defaults to 60. |
| `redirect_path`| `string` | Yes      | The path to redirect to after the timeout.        |

## How it works

This component adds a global event listener that resets a timer on any `mousemove`, `mousedown`, `touchstart`, or `keydown` event. If the timer is not reset within the configured timeout period, it will navigate to the specified `redirect_path`.

This is useful for wall-mounted tablets to return to a default screen after use.
