const { parentPort } = require('worker_threads');
const analysis = require('./gifAnalysis');

const worker = {
  async initialize(){
    parentPort.on('message', (event) => {
      this.run(event);
    });
  },
  async run(event){
    const response = await analysis.run(event);
  }

}

module.exports = worker;
worker.initialize();