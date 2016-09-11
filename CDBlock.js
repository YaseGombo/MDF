CDBlock = function(arrayBuffer, blockOffset, littleEndian, _parent){
  this.blockTypeIdentifier = null;
  this.blockSize = null;
  this.dependencyType = null;
  this.numberOfSignalsDependencies = null;
  this.pDGBlocks = [];
  this.pCGBlocks = [];
  this.pCNBlocks = [];
  this.sizeOfDimensions = [];

  this.pThisBlock = blockOffset;
  this.parent = _parent;

  this.initiallize(arrayBuffer, blockOffset, littleEndian);
};

CDBlock.prototype.initiallize = function(arrayBuffer, blockOffset, littleEndian){
  var offset = blockOffset;
  var len;

  len = 2;
  this.blockTypeIdentifier = MDF.ab2str(arrayBuffer, offset, len);
  offset += len;

  len = 2;
  this.blockSize = MDF.ab2uint16(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 2;
  this.dependencyType = MDF.ab2uint16(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 2;
  this.numberOfSignalsDependencies = MDF.ab2uint16(arrayBuffer, offset, littleEndian);
  offset += len;

  this.pDGBlocks = new Array(this.numberOfSignalsDependencies);
  this.pCGBlocks = new Array(this.numberOfSignalsDependencies);
  this.pCNBlocks = new Array(this.numberOfSignalsDependencies);
  for(var i = 0; i < this.numberOfSignalsDependencies; i++){
    len = 4;
    this.pDGBlocks[i] = MDF.ab2uint32(arrayBuffer, offset, littleEndian);
    offset += len;

    len = 4;
    this.pCGBlocks[i] = MDF.ab2uint32(arrayBuffer, offset, littleEndian);
    offset += len;

    len = 4;
    this.pCNBlocks[i] = MDF.ab2uint32(arrayBuffer, offset, littleEndian);
    offset += len;
  }

  this.sizeOfDimensions = new Array(this.getDimension());
  for(var i = 0; i < this.sizeOfDimensions.length; i++){
    len = 2;
    this.sizeOfDimensions[i] = MDF.ab2uint16(arrayBuffer, offset, littleEndian);
    offset += len;
  }
};

CDBlock.prototype.getDimension = function(){
  var dimension = 0;

  switch(this.dependencyType){
  case 0:
  case 1:
  case 2:
    dimension = this.dependencyType;
    break;
  default:
    if(this.dependencyType >= 256){
      dimension = this.dependencyType - 256;
    }
    break;
  }

  return dimension;
}
