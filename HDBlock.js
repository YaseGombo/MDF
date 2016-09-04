HDBlock = function(arrayBuffer, blockOffset, littleEndian){
  // members
  this.blockTypeIdentifier = null;
  this.blockSize = null;
  this.pFirstDGBlock = null;
  this.pFileComment = null;
  this.pPRBlock = null;
  this.numberOfDataGroups = null;
  this.date = null;
  this.time = null;
  this.authorName = null;
  this.organizationName = null;
  this.projectName = null;
  this.subject = null;
  this.timeStamp = null;
  this.UTCTimeOffset = null;
  this.timeQualityClass = null;
  this.timerIdentification = null;

  this.pThisBlock = blockOffset;
  this.fileComment = null;
  this.prBlock = null;

  this.initiallize(arrayBuffer, blockOffset, littleEndian);
};

// member functions
HDBlock.prototype.initiallize = function(arrayBuffer, blockOffset, littleEndian){
  var offset = blockOffset;
  var len;

  len = 2;
  this.blockTypeIdentifier = MDF.ab2str(arrayBuffer, offset, len);
  offset += len;

  len = 2;
  this.blockSize = MDF.ab2uint16(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 4;
  this.pFirstDGBlock = MDF.ab2uint32(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 4;
  this.pFileComment = MDF.ab2uint32(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 4;
  this.pPRBlock = MDF.ab2uint32(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 2;
  this.numberOfDataGroups = MDF.ab2uint16(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 10;
  this.date = MDF.ab2str(arrayBuffer, offset, len);
  offset += len;

  len = 8;
  this.time = MDF.ab2str(arrayBuffer, offset, len);
  offset += len;

  len = 32;
  this.authorName = MDF.ab2str(arrayBuffer, offset, len);
  offset += len;

  len = 32;
  this.organizationName = MDF.ab2str(arrayBuffer, offset, len);
  offset += len;

  len = 32;
  this.projectName = MDF.ab2str(arrayBuffer, offset, len);
  offset += len;

  len = 32;
  this.subject = MDF.ab2str(arrayBuffer, offset, len);
  offset += len;

  if(this.blockSize > (offset - blockOffset)){
    len = 8;
    this.timeStamp = MDF.ab2uint64(arrayBuffer, offset, littleEndian);
    offset += len;
  }

  if(this.blockSize > (offset - blockOffset)){
    len = 2;
    this.UTCTimeOffset = MDF.ab2int16(arrayBuffer, offset, littleEndian);
    offset += len;
  }

  if(this.blockSize > (offset - blockOffset)){
    len = 2;
    this.timeQualityClass = MDF.ab2uint16(arrayBuffer, offset, littleEndian);
    offset += len;
  }

  if(this.blockSize > (offset - blockOffset)){
    len = 32;
    this.timerIdentification = MDF.ab2str(arrayBuffer, offset, len);
    offset += len;
  }


  if(this.pFileComment != 0){
    this.fileComment = new TXBlock(arrayBuffer, this.pFileComment, littleEndian);
  }

  if(this.pPRBlock != 0){
    this.prBlock = new PRBlock(arrayBuffer, this.pPRBlock, littleEndian);
  }

};
