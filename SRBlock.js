SRBlock = function(arrayBuffer, blockOffset, littleEndian, _parent){
  this.blockTypeIdentifier = null;
  this.blockSize = null;
  this.pNextSRBlock = null;
  this.pDataBlock = null;
  this.numberOfReducedSamples = null;
  this.lengthOfTimeInterval = null;

  this.pThisBlock = blockOffset;
  this.parent = _parent;

  this.initiallize(arrayBuffer, blockOffset, littleEndian);
};

SRBlock.prototype.initiallize = function(arrayBuffer, blockOffset, littleEndian){
  var offset = blockOffset;
  var len;

  len = 2;
  this.blockTypeIdentifier = MDF.ab2str(arrayBuffer, offset, len);
  offset += len;

  len = 2;
  this.blockSize = MDF.ab2uint16(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 4;
  this.pNextSRBlock = MDF.ab2uint32(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 4;
  this.pDataBlock = MDF.ab2uint32(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 4;
  this.numberOfReducedSamples = MDF.ab2uint32(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 8;
  this.lengthOfTimeInterval = MDF.ab2double(arrayBuffer, offset, littleEndian);
  offset += len;
};
