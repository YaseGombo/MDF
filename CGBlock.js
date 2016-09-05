CGBlock = function(arrayBuffer, blockOffset, littleEndian){
  this.blockTypeIdentifier = null;
  this.blockSize = null;
  this.pNextCGBlock = null;
  this.pFirstCNBlock = null;
  this.pComment = null;
  this.recordID = null;
  this.numberOfChannels = null;
  this.sizeOfDataRecord = null;
  this.numberOfRecords = null;
  this.pFirstSRBlock = null;

  this.pThisBlock = blockOffset;
  this.cnBlocks = [];
  this.comment = null;
  this.srBlocks = [];

  this.initiallize(arrayBuffer, blockOffset, littleEndian);
};

CGBlock.prototype.initiallize = function(arrayBuffer, blockOffset, littleEndian){
  var offset = blockOffset;
  var len;

  len = 2;
  this.blockTypeIdentifier = MDF.ab2str(arrayBuffer, offset, len);
  offset += len;

  len = 2;
  this.blockSize = MDF.ab2uint16(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 4;
  this.pNextCGBlock = MDF.ab2uint32(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 4;
  this.pFirstCNBlock = MDF.ab2uint32(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 4;
  this.pComment = MDF.ab2uint32(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 2;
  this.recordID = MDF.ab2uint16(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 2;
  this.numberOfChannels = MDF.ab2uint16(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 2;
  this.sizeOfDataRecord = MDF.ab2uint16(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 4;
  this.numberOfRecords = MDF.ab2uint32(arrayBuffer, offset, littleEndian);
  offset += len;

  if(this.blockSize > (offset - blockOffset)){
    len = 4;
    this.pFirstSRBlock = MDF.ab2uint32(arrayBuffer, offset, littleEndian);
    offset += len;
  }

  this.setCNBlocks(arrayBuffer, this.pFirstCNBlock, littleEndian);
  this.setComment(arrayBuffer, this.pComment, littleEndian);
  this.setSRBlocks(arrayBuffer, this.pFirstSRBlock, littleEndian);
};

CGBlock.prototype.setCNBlocks = function(arrayBuffer, initialOffset, littleEndian){
  var offset = initialOffset;

  while(offset){
    var cnBlock = new CNBlock(arrayBuffer, offset, littleEndian);
    this.cnBlocks.push(cnBlock);
    offset = cnBlock.pNextCNBlock;
  }
};

CGBlock.prototype.setComment = function(arrayBuffer, initialOffset, littleEndian){
  if(initialOffset){
    this.comment = new TXBlock(arrayBuffer, initialOffset, littleEndian);
  }
};

CGBlock.prototype.setSRBlocks = function(arrayBuffer, initialOffset, littleEndian){
  var offset = initialOffset;

  while(offset){
    var srBlock = new SRBlock(arrayBuffer, offset, littleEndian);
    this.srBlocks.push(srBlock);
    offset = srBlock.pNextSRBlock;
  }
};
