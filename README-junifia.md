# Env

Copy the content of this https://app.clickup.com/10555531/v/dc/a244b-51251/a244b-23411 in .env file

# Run

npm run dev

# Update chat backend url

in the file chat.js in extensions/chat-bubble/assets/chat.js
at line 484 update the port to the one that remix use

```
const streamUrl = 'http://localhost:35829/chat';
```
