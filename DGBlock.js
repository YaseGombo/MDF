DGBlock = function(arrayBuffer, blockOffset, littleEndian){
  this.blockTypeIdentifier = null;
  this.blockSize = null;
  this.pNextDGBlock = null;
  this.pFirstCGBlock = null;
  this.pTRBlock = null;
  this.pDataBlock = null;
  this.numberOfChannelGroups = null;
  this.numberOfRecordIDs = null;

  this.pThisBlock = blockOffset;
  this.trBlock = null;
  this.cgBlocks = [];

  this.initiallize(arrayBuffer, blockOffset, littleEndian);
};

DGBlock.prototype.initiallize = function(arrayBuffer, blockOffset, littleEndian){
  var offset = blockOffset;
  var len;

  len = 2;
  this.blockTypeIdentifier = MDF.ab2str(arrayBuffer, offset, len);
  offset += len;

  len = 2;
  this.blockSize = MDF.ab2uint16(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 4;
  this.pNextDGBlock = MDF.ab2uint32(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 4;
  this.pFirstCGBlock = MDF.ab2uint32(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 4;
  this.pTRBlock = MDF.ab2uint32(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 4;
  this.pDataBlock = MDF.ab2uint32(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 2;
  this.numberOfChannelGroups = MDF.ab2uint16(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 2;
  this.numberOfRecordIDs = MDF.ab2uint16(arrayBuffer, offset, littleEndian);
  offset += len;

  this.setCGBlocks(arrayBuffer, this.pFirstCGBlock, littleEndian);
  this.setTRBlock(arrayBuffer, this.pTRBlock, littleEndian);
};

DGBlock.prototype.setCGBlocks = function(arrayBuffer, initialOffset, littleEndian){
  var offset = initialOffset;

  while(offset){
    var cgBlock = new CGBlock(arrayBuffer, offset, littleEndian);
    this.cgBlocks.push(cgBlock);
    offset = cgBlock.pNextCGBlock;
  }
};

DGBlock.prototype.setTRBlock = function(arrayBuffer, initialOffset, littleEndian){
  if(initialOffset){
    this.trBlock = new TRBlock(arrayBuffer, initialOffset, littleEndian);
  }
};

DGBlock.prototype.isSorted = function(){
  return (this.cgBlocks.length == 1);
};

DGBlock.prototype.readDataBlock = function(arrayBuffer, initialOffset, littleEndian){
  var offset = initialOffset;

  if(offset){
    var cgCounters = (new Array(this.cgBlocks.length)).fill(0); // Zeros(this.cgBlocks.length);

    while(true){
      var cgIndex = 0;
      if(this.isSorted() == false){
        var currentRecordID = MDF.ab2uint8(arrayBuffer, offset);
        for(var i = 0; i < this.cgBlocks.length; i++){
          if(this.cgBlocks[i].recordID == currentRecordID){
            cgIndex = i;
            break;
          }
        }
      }
      var currentCGBlock = this.cgBlocks[cgIndex];

      if(this.numberOfRecordIDs > 0)  offset += 1;

      for(var i = 0; i < currentCGBlock.cnBlocks.length; i++){
        var theCNBlock = currentCGBlock.cnBlocks[i];
        theCNBlock.pushRawData(arrayBuffer, offset, littleEndian);
      }

      offset += currentCGBlock.sizeOfDataRecord;
      if(this.numberOfRecordIDs == 2)  offset += 1;

      cgCounters[cgIndex]++;

      var isEndOfDataBlock = true;
      for(var i = 0; i < this.cgBlocks.length; i++){
        if(cgCounters[i] != this.cgBlocks[i].numberOfRecords){
          isEndOfDataBlock = false;
          break;
        }
      }
      if(isEndOfDataBlock) break;
    }
  }
};
