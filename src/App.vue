<template>
  <div id="app">
    <div class="header">
      <div class="header-logo">
        <img src="./assets/img/logo.svg">
      </div>
    </div>
    <div class="content">
      <div>
        <div class="logo">
          <img src="./assets/img/zelcore-round-dark.svg">
        </div>
        <button
          class="bigger"
          @click="openzelcoreDeepLink"
        >
          OPEN IN ZELCORE
        </button>
      </div>
      <div class="note">
        <br>
        Please allow pop up windows for smooth zelcore interaction.
      </div>
      <div class="gridThis paddingmobile">
        <div class="card">
          <a
            href="https://itunes.apple.com/us/app/zelcore/id1436296839?mt=8"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="./assets/img/appstore.svg">
          </a>
        </div>
        <div class="card">
          <a
            href="https://play.google.com/store/apps/details?id=com.zelcash.zelcore"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="./assets/img/googleplay.svg">
          </a>
        </div>
        <div class="card">
          <a
            href="https://resources.zelcore.io/downloads/zelcore.apk"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="./assets/img/directdownload.svg">
          </a>
        </div>
      </div>
      <div class="gridThis paddingdesktop">
        <div class="card">
          <a
            href="https://resources.zelcore.io/downloads/zelcore.dmg"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="./assets/img/macos.png">
          </a>
        </div>
        <div class="card">
          <a
            href="https://resources.zelcore.io/downloads/zelcore.exe"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="./assets/img/windows.png">
          </a>
        </div>
        <div class="card">
          <a
            href="https://resources.zelcore.io/downloads/zelcore.deb"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="./assets/img/linux.png">
          </a>
        </div>
      </div>
    </div>
    <br><br>
    <div class="footer">
      <br>
      <a
        href="https://zelcore.io"
        target="_blank"
        rel="noopener noreferrer"
      >zelcore.io</a>
    </div>
  </div>
</template>

<script>

const axios = require('axios');

export default {
  name: 'App',
  components: {},
  data() {
    return {
      origin: null,
      zelcorerequestid: null, // last request id that we are asking for our database
      adapterid: null,
      pollinResponseInterval: null,
      network: null,
      endpoint: 'https://link.zelcore.io',
      storedLink: null,
      eventid: null,
    };
  },
  beforeDestroy() {
    if (window.opener) {
      window.opener.postMessage({
        jsonrpc: '2.0',
        method: 'disconnected',
      }, this.origin);
      const deeplink = `zel:?action=adapter&adapterid=${this.adapterid}&method=disconnected&origin=${this.origin}&network=${this.network}`;
      window.open(deeplink, '_blank');
    }
  },
  mounted() {
    const self = this;
    console.log(window.location.pathname.substring(1));
    console.log(window.location.search);
    const origin = new URLSearchParams(window.location.hash.slice(1)).get('origin');
    const network = new URLSearchParams(window.location.hash.slice(1)).get('network');
    console.log(origin);
    console.log(network);
    if (window.opener) {
      this.initiateAdapter();
    } else {
      setTimeout(() => {
        self.openzelcoreDeepLink();
      }, 2000);
    }
  },
  methods: {
    openzelcoreDeepLink() {
      const deeplink = 'zel:?';
      const page = deeplink + window.location.pathname.substring(1) + window.location.search;
      console.log(page);
      const link = this.storedLink || page;
      window.open(link, '_blank');
    },
    id() {
      const timestamp = new Date().getTime();
      const phrase = timestamp + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      return phrase;
    },
    async initiateAdapter() {
      try {
        const self = this;
        const lok = new URLSearchParams(window.location.hash.slice(1));
        this.origin = lok.get('origin');
        this.network = lok.get('network');
        this.adapterid = this.id();
        window.onmessage = (event) => {
          if (event.source === window.opener && event.origin === this.origin) { // veriy origin and source
            self.adapterEvent(event);
          }
        };
        setInterval(() => {
          self.pollIsActive();
        }, 2000);
        // constant polling for response
        this.zelcorerequestid = this.id();
        console.log(this.zelcorerequestid);
        this.pollinResponseInterval = setInterval(() => {
          self.pollGetResponse();
        }, 2000);
        const data = {
          operationid: this.zelcorerequestid,
          request: {
            coin: 'solana',
            method: 'connected',
            adapterid: this.adapterid,
            params: decodeURIComponent(window.location.hash.slice(1)),
          },
        };
        const res = await axios.post(`${this.endpoint}/api/adapter`, data); // no need response
        console.log(res);
        const deeplink = `zel:?action=adapter&adapterid=${this.adapterid}&method=connected&origin=${this.origin}&network=${this.network}&operationid=${this.zelcorerequestid}`;
        this.storedLink = deeplink;
        console.log(deeplink);
        window.open(deeplink, '_blank');
      } catch (error) {
        console.log(error);
      }
    },
    async adapterEvent(event) {
      // new incoming request
      console.log(event);
      const self = this;
      this.zelcorerequestid = this.id();
      clearInterval(this.pollinResponseInterval);
      this.pollinResponseInterval = null;
      this.pollinResponseInterval = setInterval(() => {
        self.pollGetResponse();
      }, 2000);
      this.eventid = event.data.id;
      const deeplink = `zel:?action=adapter&adapterid=${this.adapterid}&method=${event.data.method}&origin=${this.origin}&network=${this.network}&operationid=${this.zelcorerequestid}`;
      this.storedLink = deeplink;
      const data = {
        operationid: this.zelcorerequestid,
        request: {
          coin: 'solana',
          method: event.data.method,
          adapterid: this.adapterid,
          params: event.data.params,
        },
      };
      if (event.data.params.data) {
        try {
          // according to specs it shall be uint8array
          const enc = new TextDecoder(event.data.params.display || 'utf-8');
          const text = enc.decode(event.data.params.data);
          data.request.params.data = text;
        } catch (error) {
          console.log(error);
        }
      }
      const res = await axios.post(`${this.endpoint}/api/adapter`, data); // no need response
      console.log(res);
      window.open(deeplink, '_blank');
    },
    async pollGetResponse() {
      try {
        const response = await axios.get(`${this.endpoint}/api/adapter/${this.zelcorerequestid}`);
        if (response.data.data.response) {
          // zelcore already responded to it
          window.opener.postMessage({
            id: this.eventid,
            jsonrpc: '2.0',
            method: response.data.data.request.method,
            params: response.data.data.response,
            result: response.data.data.response,
          }, this.origin);
          clearInterval(this.pollinResponseInterval);
          this.pollinResponseInterval = null;
        }
      } catch (error) {
        console.log(error);
      }
    },
    async pollIsActive() {
      if (window.opener && this.adapterid) {
        const status = await axios.get(`${this.endpoint}/api/adapterstatus/${this.adapterid}`);
        if (status.data === 'disconnect') {
          window.opener.postMessage({
            jsonrpc: '2.0',
            method: 'disconnected',
          }, this.origin);
          window.close(); // has window.opener so it will work
        }
      }
    },
  },
};
</script>

<style src="./assets/css/main.css"></style>
