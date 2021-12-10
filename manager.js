const { Worker } = require('worker_threads');

const workers = []; // {instance, running}
const tasks = [];
const amountOfWorkers = 4;

module.exports = {
  initialize(){
    for(let i = 0; i < amountOfWorkers; i++){
      const worker = new Worker('./worker/worker.js');
      worker.on("message", (event) => this.handleResponse(event));
      workers.push({instance: worker, running: false});
    }
  },
  addTask(event){
    if(tasks.length === 0 && !workers.some(worker => worker.running)){
      this.assignWork(event);
    }else{
      tasks.push(event);
    }
  },
  assignWork(event){
    const availableWorker = workers.find(worker => !worker.running);
    if(availableWorker){
      availableWorker.running = true;
      availableWorker.instance.postMessage(event);
    }
  },
  async handleResponse(event){
    console.log("WIP: ended");
    //Assign grab new task from queue if available
    if(tasks.length > 0){
      this.assignWork(tasks.shift());
    }
  }
}