# FTGBot (FTG2085) - Discord Selfbot

FTGBot is a selfbot designed to perform various administrative actions in a Discord group or channel. This bot is intended for educational and demonstration purposes only. **USE AT YOUR OWN RISK. Selfbot behavior may violate Discord's Terms of Service.**

## Features

- Custom Rich Presence
- Manage group chat ownership
- Remove users from group chats
- Create new group chats
- Voting system for user removal
- Command-based interactions

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [discord.js-selfbot-v13](https://github.com/aiko-chan-ai/discord.js-selfbot-v13)
- [chalk](https://www.npmjs.com/package/chalk)

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/FTG2085/FTGBot.git
    cd FTGBot
    ```

2. Install the required packages:
    ```sh
    npm i
    ```

3. Update the configuration values in the code:
    ```json
    {
    "TOKEN": "",
    "BOT_USER_ID": "",
    "OWNER_ID": "",
    "DEBUG_MODE": false,
    "blocklist": [
        1234567890,
        1234567890
    ]
    }
    ```

4. Run the bot:
    ```sh
    node index
    ```

### Commands

The selfbot listens for commands prefixed with `!`. Below are the available commands:

#### `!yesking <user_id>`

Makes the specified user the owner of the current group chat.

#### `!removeuser <user_id>`

Removes the specified user from the current group chat.

#### `!voteremove <user_id> <timer>`

Starts a vote to remove the specified user from the group chat. The timer specifies the duration of the vote in seconds.

#### `!millxisannoying`, `!kysmillx`, `!stfumillx`, `!stfu millx`, `!millx stfu`

Removes the user with ID `720022112466894970` from the current group chat. This command is only available to the owner.

#### `!debug`

Fetches the list of user relationships (friends, blocked, etc.) for testing purposes. This command is only available to the owner.

#### `!selfdestruct`

Removes all users from the current group chat and creates a new group chat with the users in the blocklist. This command is only available to the owner.

## Important Notes

- This bot uses a Discord user token, which is against Discord's Terms of Service. Use at your own risk.
- This bot is intended for educational purposes only.
- Always follow Discord's guidelines and policies.

## Disclaimer

The authors are not responsible for any misuse of this bot. Use it responsibly and at your own risk.

## License

This project is licensed under the MIT License.
