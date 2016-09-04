TRBlock = function(arrayBuffer, blockOffset, littleEndian){
  this.blockTypeIdentifier = null;
  this.blockSize = null;
  this.pTriggerComment = null;
  this.numberOfTriggerEvents = null;
  this.triggerTimes = [];
  this.preTriggerTimes = [];
  this.postTriggerTimes = [];

  this.triggerComment = null;

  this.pThisBlock = blockOffset;

  this.initiallize(arrayBuffer, blockOffset, littleEndian);
};

TRBlock.prototype.initiallize = function(arrayBuffer, blockOffset, littleEndian){
  var offset = blockOffset;
  var len;

  len = 2;
  this.blockTypeIdentifier = MDF.ab2str(arrayBuffer, offset, len);
  offset += len;

  len = 2;
  this.blockSize = MDF.ab2uint16(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 4;
  this.pTriggerComment = MDF.ab2uint32(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 2;
  this.numberOfTriggerEvents = MDF.ab2uint16(arrayBuffer, offset, littleEndian);
  offset += len;

  this.triggerTimes = new Array(this.numberOfTriggerEvents);
  this.preTriggerTimes = new Array(this.numberOfTriggerEvents);
  this.postTriggerTimes = new Array(this.numberOfTriggerEvents);
  for(var i = 0; i < this.numberOfTriggerEvents; i++){
    if( ( offset - blockOffset ) >= this.blockSize )  break;

    len = 4;
    this.triggerTimes[i] = MDF.ab2double(arrayBuffer, offset, littleEndian);
    offset += len;

    len = 4;
    this.preTriggerTimes[i] = MDF.ab2double(arrayBuffer, offset, littleEndian);
    offset += len;

    len = 4;
    this.postTriggerTimes[i] = MDF.ab2double(arrayBuffer, offset, littleEndian);
    offset += len;
  }

  this.setTriggerComment(arrayBuffer, this.pTriggerComment, littleEndian);
};

TRBlock.prototype.setTriggerComment = function(arrayBuffer, initialOffset, littleEndian){
  this.triggerComment = new TXBlock(arrayBuffer, initialOffset, littleEndian);
};
