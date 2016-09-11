CEBlock = function(arrayBuffer, blockOffset, littleEndian, _parent){
  this.blockTypeIdentifier = null;
  this.blockSize = null;
  this.extensionType = null;
  this.additionalFields = [];
  
  this.pThisBlock = blockOffset;
  this.parent = _parent;

  this.initiallize(arrayBuffer, blockOffset, littleEndian);
};

CEBlock.prototype.initiallize = function(arrayBuffer, blockOffset, littleEndian){
  var offset = blockOffset;
  var len;

  len = 2;
  this.blockTypeIdentifier = MDF.ab2str(arrayBuffer, offset, len);
  offset += len;

  len = 2;
  this.blockSize = MDF.ab2uint16(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 2;
  this.extensionType = MDF.ab2uint16(arrayBuffer, offset, littleEndian);
  offset += len;

  len = this.blockSize - ( offset - blockOffset );
  this.setAdditionalFields(arrayBuffer, offset, littleEndian);
  offset += len;
};

CEBlock.prototype.setAdditionalFields = function(arrayBuffer, initialOffset, littleEndian){
  var data = [];
  var offset = initialOffset;

  switch(this.extensionType){
  case 2:
    data = new Array(4);

    var len = 2;
    data[0] = MDF.ab2uint16(arrayBuffer, offset, littleEndian);
    offset += len;

    len = 4;
    data[1] = MDF.ab2uint32(arrayBuffer, offset, littleEndian);
    offset += len;

    len = 80;
    data[2] = MDF.ab2str(arrayBuffer, offset, len);
    offset += len;

    len = 32;
    data[3] = MDF.ab2str(arrayBuffer, offset, len);
    offset += len;
    break;
  case 19:
    data = new Array(4);

    var len = 4;
    data[0] = MDF.ab2uint32(arrayBuffer, offset, littleEndian);
    offset += len;

    len = 4;
    data[1] = MDF.ab2uint32(arrayBuffer, offset, littleEndian);
    offset += len;

    len = 36;
    data[2] = MDF.ab2str(arrayBuffer, offset, len);
    offset += len;

    len = 36;
    data[3] = MDF.ab2str(arrayBuffer, offset, len);
    offset += len;
    break;
    break;
  }

  this.additionalFields = data;
};
