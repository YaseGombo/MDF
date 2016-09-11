IDBlock = function(arrayBuffer, blockOffset, _parent){
  // members
  this.fileIdentifier = null;
  this.formatIdentifier = null;
  this.programIdentifier = null;
  this.defaultByteOrder = null;
  this.defaultFloatingPointFormat = null;
  this.versionNumber = null;
  this.codePageNumber = null;
  this.standardFlags  = null;
  this.customFlags = null;

  this.pThisBlock = blockOffset;
  this.parent = _parent;

  this.initiallize(arrayBuffer, blockOffset);
};

// member functions
IDBlock.prototype.initiallize = function(arrayBuffer, blockOffset){
  var offset = blockOffset;
  var len;

  len = 8;
  this.fileIdentifier = MDF.ab2str(arrayBuffer, offset, len);
  offset += len;

  len = 8;
  this.formatIdentifier = MDF.ab2str(arrayBuffer, offset, len);
  offset += len;

  len = 8;
  this.programIdentifier = MDF.ab2str(arrayBuffer, offset, len);
  offset += len;

  len = 2;
  this.defaultByteOrder = MDF.ab2uint16(arrayBuffer, offset, true);
  offset += len;

  var littleEndian = (this.defaultByteOrder == 0);

  len = 2;
  this.defaultFloatingPointFormat = MDF.ab2uint16(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 2;
  this.versionNumber = MDF.ab2uint16(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 2;
  this.codePageNumber = MDF.ab2uint16(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 2;
  // reserved
  offset += len;

  len = 26;
  // reserved
  offset += len;

  len = 2;
  this.standardFlags = MDF.ab2uint16(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 2;
  this.customFlags = MDF.ab2uint16(arrayBuffer, offset, littleEndian);
  offset += len;
};

IDBlock.prototype.isLittleEndian = function(){
  var ans = null;
  if(this && (this.defaultByteOrder != null)) ans = (this.defaultByteOrder == 0);
  return ans;
};
