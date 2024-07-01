# Instagram Image Scraper
This script scrapes images from the feed of specified Instagram users using Puppeteer in Node.js. The script downloads the images and saves the image filenames in a JSON file along with the download date.

## Prerequisites
- Node.js (v12.0.0 or higher)
- npm (v6.0.0 or higher)

## Installation
1. Clone this repository or download the script files.
2. Navigate to the directory containing the script.
3. Install the required dependencies by running:

    ```sh
    npm install puppeteer
    ```

## Configuration
Create a `config.json` file in the same directory as the script with the following structure:

```json
{
    "usernames": [
        "username1",
        "username2",
        "username3"
    ]
}
