const fetch = require('node-fetch');
const getpixels = require('get-pixels');
const savepixel = require('save-pixels');
const util = require('util');
const fs = require('fs');
const ndarray = require('ndarray');
var zeros = require("zeros")
var savePixels = require("save-pixels")
var gifEncoder = require('gif-encoder');

module.exports = {
  async run(event){
    //First grab the gif from the internet
    const url = event.content;
    const buffer = await this.download(url);
    fs.writeFileSync('./test.gif', buffer);
    //Then get the frame pixels from gif
    const pixels = await util.promisify(getpixels)(buffer, "image/gif");
    //Then analyze the pixels
    const analysis = this.analyze3(pixels);
  },
  async download(url){
    return (await fetch(url)).buffer();
  },
  async analyze(pixels){
    //Try to repack frame 
    // let colorPack = [];
    let x = 0;
    let y = 0;
    const frame = 0
    while(true){
      let r = pixels.get(frame, x, y, 0);
      if(r !== undefined){
        let g = pixels.get(frame, x, y, 1);
        let b = pixels.get(frame, x, y, 2);
        let a = pixels.get(frame, x, y, 3);
        let color = [r, g, b, a];
        
        // if(!colorPack[x]) colorPack[x] = [];
        // if(!colorPack[x][y]) colorPack[x][y] = [];
        // colorPack[x][y] = color;
        x++;
      }else if(x !== 0){
        y++;
        x = 0;
      }else{
        break;
      }
    }
    //test with saving pixels
    // const stream = fs.createWriteStream('./frame.png');
    console;
  },

  async analyze2(pixels){
    const frames = pixels.shape[0];
    const width = pixels.shape[1];
    const height = pixels.shape[2];
    const channels = pixels.shape[3];

    let colorPack = [];

    //Initialize rg
    var crg = zeros([frames, 255, 255])
    var crb = zeros([frames, 255, 255])
    var cgb = zeros([frames, 255, 255])

    
    for(let frameIndex = 0; frameIndex < frames; frameIndex++){
      for(let x = 0; x < width; x++){
        for(let y = 0; y < height; y++){
          let r = pixels.get(frameIndex, x, y, 0);
          let g = pixels.get(frameIndex, x, y, 1);          
          let b = pixels.get(frameIndex, x, y, 2);
          // let a = pixels.get(frame, x, y, 3);

          crg.set(frameIndex, r, g, 255)
          crb.set(frameIndex, r, b, 255)
          cgb.set(frameIndex, g, b, 255)
        }
      }
    }

    const streamRg = fs.createWriteStream('./rg.gif');
    const streamRb = fs.createWriteStream('./rb.gif');
    const streamGb = fs.createWriteStream('./gb.gif');
    savePixels(crg, "gif").pipe(streamRg);
    savePixels(crb, "gif").pipe(streamRb);
    savePixels(cgb, "gif").pipe(streamGb);
  },

  async analyze3(pixels){
    const frames = pixels.shape[0];
    const width = pixels.shape[1];
    const height = pixels.shape[2];
    const channels = pixels.shape[3];
    const combinations = [
      ["r", "b"],
      ["r", "g"],
      ["b", "g"]
    ]

    const gifs = combinations.map(function(combo){
      const gif = new gifEncoder(255, 255);
      fs.unlinkSync(`./${combo[0]}${combo[1]}.gif`);
      const stream = fs.createWriteStream('./' + combo[0] + combo[1] + '.gif');
      gif.pipe(stream);
      gif.writeHeader();
      return gif;
    });

  
    for(let frameIndex = 0; frameIndex < frames; frameIndex++){
      //Initialize rg
      var crg = zeros([255, 255])
      var crb = zeros([255, 255])
      var cgb = zeros([255, 255])

      crb.data = crb.data.map(() => 255);
      crg.data = crg.data.map(() => 255);
      cgb.data = cgb.data.map(() => 255);

      for(let x = 0; x < width; x++){
        for(let y = 0; y < height; y++){
          let r = pixels.get(frameIndex, x, y, 0);
          let g = pixels.get(frameIndex, x, y, 1);          
          let b = pixels.get(frameIndex, x, y, 2);
          // let a = pixels.get(frame, x, y, 3);

          crg.set(r, g, 0)
          crb.set(r, b, 0)
          cgb.set(g, b, 0)
        }
      }

      gifs[0].addFrame(crb.data.reduce((acc, val) => {
        acc.push(val, val, val, 255);
        return acc;
      }, []));
      gifs[1].addFrame(crg.data.reduce((acc, val) => {
        acc.push(val, val, val, 255);
        return acc;
      }, []));
      gifs[2].addFrame(cgb.data.reduce((acc, val) => {
        acc.push(val, val, val, 255);
        return acc;
      }, []));
    }
    
    gifs.forEach(function(gif){
      gif.finish();
    });
  }
}