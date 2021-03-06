# better-crewlink-mobile
[![Donate][paypal-shield]](paypal-url)

<br />
<p align="center">
  <a>
    <img src="logo.png" alt="Logo" width="80" height="80">
  </a>
  <h3 align="center">BetterCrewLink Mobile is here!</h3>


  <p align="center">
    Free, open, Among Us proximity voice chat.
    <br />
    <a href="https://github.com/OhMyGuus/better-crewlink-mobile/issues">Report Bug</a>
    ·
    <a href="https://github.com/OhMyGuus/better-crewlink-mobile/issues">Request Feature</a>
  </p>
  <p align="center">
    <b><a href="https://www.paypal.com/donate?hosted_button_id=KS43BDTGN76JQ">DONATE TO BETTERCREWLINK</a></b></br>
  (all donations will be used for the apple developer license and extra servers)</br>
   <b><a href="https://paypal.me/ottomated">Donate to ottomated (offical crewlink)</a></b>
  </p>
</p>
<hr />

<p>
  
<b>Notes:</b><br />

 - For issues with this fork u can message me on discord (ThaGuus#2140) and I will do
   my best to resolve it.
  -  To get the most of BetterCrewLink use the voice server`http://bettercrewl.ink:6523`

</p>
<a href="https://discord.gg/qDqTzvj4SH"> <img src="https://i.imgur.com/XpnBhTW.png" width="150px" /> </a>



<!-- TABLE OF CONTENTS -->
## Table of Contents

* [About the Project](#about-the-project)
* [Installation](#installation)
* [Development](#development)
  * [Prerequisites](#prerequisites)
  * [Setup](#setup)
* [Contributing](#contributing)

<!-- ABOUT THE PROJECT -->
## About The Project

This project implements proximity voice chat for mobile users in Among Us. As long as there is a PC user with 'Mobile Host' enabled in your lobby, you will be able to hear people near you.

## Installation

Download the latest version from [releases](https://github.com/OhMyGuus/better-crewlink-mobile/releases) and run the `Bettercrewlink-v-X-X-X-a.apk` file on your phone. You may have to allow chrome to install apps on your phone.

You can also use the web version in your browser [here](https://web.bettercrewl.ink/).

If you can, you should use a private server by deploying [this repository](https://github.com/OhMyGuus/BetterCrewLink-server).

### Setup Instructions

* Open the app
* Ensure there is one person in the lobby with "Mobile Host" enabled on their pc (they must use [Better Crew Link](https://github.com/OhMyGuus/BetterCrewLink))
* Fill in the required information (make sure you have a unique name in your lobby)
* Hit the connect button
  * If you are waiting on the connecting screen for a while you may want to check that all the information is correct and the is a pc user with 'Mobile Host' enabled in the lobby
* All done!

## Development

You only need to follow the below instructions if you are trying to modify this software. Otherwise, please download the latest version from the [github releases](https://github.com/OhMyGuus/better-crewlink-mobile/releases).

Server code is located at [OhMyGuus/BetterCrewLink-server](https://github.com/OhMyGuus/BetterCrewLink-server). Please use a local server for development purposes.

### Prerequisites

This is an example of how to list things you need to use the software and how to install them.
* [node.js](https://nodejs.org/en/download/)
* Ionic
```sh
npm install -g @ionic/cli
```
* Cordova
```sh
npm install -g ionic cordova
```

### Setup

1. Clone the repo
```sh
git clone https://github.com/OhMyGuus/better-crewlink-mobile.git
cd better-crewlink-mobile
```
2. Install Ionic packages
```sh
npm install @ionic/angular@latest --save
ionic cordova plugin add cordova-plugin-appcenter-analytics
npm install @ionic-native/app-center-analytics
```
3. Run the project
```JS
ionic serve
```

<!-- CONTRIBUTING -->
## Contributing

Any contributions you make are greatly appreciated.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


[paypal-url]: https://www.paypal.com/donate?hosted_button_id=KS43BDTGN76JQ
[paypal-shield]: https://img.shields.io/badge/Donate-PayPal-green.svg
