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

