# Discord Subscriber Validation Bot

[![Greenkeeper badge](https://badges.greenkeeper.io/mmaines16/discord-subscriber-email-bot.svg)](https://greenkeeper.io/)

This is a Discord Bot & Server implementation that, when a user role is added to a incomming user,
propmts the user to give thier email and name, stores that information in a email list provider (such as MarketHero.io), and applies a second user role to validated subscribers, using one of two strategies: 
1) __a OAuth2 Server__
2) __Prompting the user to enter a series of commands in a specified channel__

__By Default, both are available__