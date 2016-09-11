PRBlock = function(arrayBuffer, blockOffset, littleEndian, _parent){
  this.blockTypeIdentifier = null;
  this.blockSize = null;
  this.programSpecificData = null;

  this.pThisBlock = blockOffset;
  this.parent = _parent;

  this.initiallize(arrayBuffer, blockOffset, littleEndian);
};

PRBlock.prototype.initiallize = function(arrayBuffer, blockOffset, littleEndian){
  var offset = blockOffset;
  var len;

  len = 2;
  this.blockTypeIdentifier = MDF.ab2str(arrayBuffer, offset, len);
  offset += len;

  len = 2;
  this.blockSize = MDF.ab2uint16(arrayBuffer, offset, littleEndian);
  offset += len;

  len = this.blockSize - ( offset - blockOffset );
  this.programSpecificData = MDF.ab2str(arrayBuffer, offset, len);
  offset += len;
};
