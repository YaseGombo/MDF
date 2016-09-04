TXBlock = function(arrayBuffer, blockOffset, littleEndian){
  this.blockTypeIdentifier = null;
  this.blockSize = null;
  this.text = null;

  this.pThisBlock = blockOffset;

  this.initiallize(arrayBuffer, blockOffset, littleEndian);
};

TXBlock.prototype.initiallize = function(arrayBuffer, blockOffset, littleEndian){
  var offset = blockOffset;
  var len;

  len = 2;
  this.blockTypeIdentifier = MDF.ab2str(arrayBuffer, offset, len);
  offset += len;

  len = 2;
  this.blockSize = MDF.ab2uint16(arrayBuffer, offset, littleEndian);
  offset += len;

  len = this.blockSize - ( offset - blockOffset );
  this.text = MDF.ab2str(arrayBuffer, offset, len);
  offset += len;
};
