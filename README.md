# Zelcore LINK

Zelcore LINK lets you connect dApp to zelcore via https requests to link.zelcore.io instead of using zelcore protocol scheme. It lets you do huge post requests as well
How does it work?
dApp makes a call to link.zelcore.io, link.zelcore.io makes zelcore protocol call to zelcore telling zelcore what request has been made and asking zelcore to open stored request in link.zelcore.io
zelcore opens the requsts and sends back its reply to to dApp directly or to link.zelcore.io that forwards the ask back

## Requirements

Requires node version 8.0 and above, mongodb

## Installation

Install npm dependencies with command:

```javascript
npm install
```

```javascript
npm run build
```

## Usage

Start the service with command:

```javascript
npm start
```

Service will be started on 127.0.0.1:8123

