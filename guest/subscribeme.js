(function () {

  function SubscribeMe(options) {
    const self = this;

    this.domainsList = options.domainsList;
    this.urlGenerator = this.createUrlGenerator();
    this._newWindow = null;
    this.templateHTML = document.querySelector(options.templateSelector);

    this.templateHTML
      .querySelector("button")
      .addEventListener("click", function() {
          self.templateHTML.querySelector(".notifs-message").style.display = "none";
          self.start();
      });
  }

  SubscribeMe.prototype.createUrlGenerator = function* () {
    while (this.domainsList.length !== 0) {
        yield this.domainsList.shift();
    }
  };

  SubscribeMe.prototype.getWindow = function() {
    const self = this;

    if (this._newWindow === null) {
      this._newWindow = open("about:blank", "subscribeWindow", "width=600,height=400");
      this._newWindow.opener = window;

      window.addEventListener("message", function(event) {
        self.getResponse(event.data);
      });
    }

    return this._newWindow;
  };

  SubscribeMe.prototype.getResponse = function(message) {
    // console.log(message);
    switch (message) {
      case "user-allowed":
        this.templateHTML.style.display = "none";
        this._newWindow.close();
        break;
      case "user-denied":
        this.start();
        break;
    }
  };

  SubscribeMe.prototype.start = function() {
    const url = this.urlGenerator.next().value;
    const newWindow = this.getWindow();

    // console.log("ENTER");
    // console.log("Message", message);
    // console.log("URL", url);

    if (url !== undefined) newWindow.location.href = url;
    else this._newWindow.close();
  };

  window.SubscribeMe = SubscribeMe;

})();
