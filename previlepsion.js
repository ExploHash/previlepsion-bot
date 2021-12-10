const fetch = require('node-fetch');
const manager = require("./manager");


module.exports = {
  initialize(){
    manager.initialize();
  },
  async processMessage(message) {
    let { content } = message;
    if(content.startsWith("https://") || content.startsWith("http://")) {
      if(content.includes("tenor.com")) message.content += ".gif";
      const contentType = await this.grabContentType(message.content);

      if(contentType === "image/gif") {
        await this.startAnalyzing(message, "gif");
      }
    }
  },

  async grabContentType(url) {
    const response = await fetch(url, {method: 'HEAD'});
    return response.headers.get('content-type');
  },

  async startAnalyzing(message, type){
    manager.addTask(message);
  }
}