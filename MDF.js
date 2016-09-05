MDF = function(arrayBuffer){
  // members
  this.idBlock = null;
  this.hdBlock = null;
  this.dgBlocks = [];

  this.initiallize(arrayBuffer);
};

// static functions
MDF.ab2bytes = function(arrayBuffer, offset, len){
  var ary_u8 = new Uint8Array(arrayBuffer, offset, len);
  return ary_u8;
};
MDF.ab2str = function(arrayBuffer, offset, len){
  var ary_u8 = new Uint8Array(arrayBuffer, offset, len);
  var str_with_nul = String.fromCharCode.apply(null, ary_u8);
  return String.split(str_with_nul, '\0')[0];
};
MDF.ab2uint8 = function(arrayBuffer, offset){
  var dataView = new DataView(arrayBuffer, offset, 1);
  return dataView.getUint8(0);
};
MDF.ab2int8 = function(arrayBuffer, offset){
  var dataView = new DataView(arrayBuffer, offset, 1);
  return dataView.getInt8(0);
};
MDF.ab2uint16 = function(arrayBuffer, offset, littleEndian){
  var dataView = new DataView(arrayBuffer, offset, 2);
  return dataView.getUint16(0, littleEndian);
};
MDF.ab2int16 = function(arrayBuffer, offset, littleEndian){
  var dataView = new DataView(arrayBuffer, offset, 2);
  return dataView.getInt16(0, littleEndian);
};
MDF.ab2uint32 = function(arrayBuffer, offset, littleEndian){
  var dataView = new DataView(arrayBuffer, offset, 4);
  return dataView.getUint32(0, littleEndian);
};
MDF.ab2int32 = function(arrayBuffer, offset, littleEndian){
  var dataView = new DataView(arrayBuffer, offset, 4);
  return dataView.getInt32(0, littleEndian);
};
MDF.ab2uint64 = function(arrayBuffer, offset, littleEndian){
  var dataView = new DataView(arrayBuffer, offset, 8);
  var uint32_first = dataView.getUint32(0, littleEndian);
  var uint32_last = dataView.getUint32(4, littleEndian);
  return (littleEndian) ? (uint32_first + (uint32_last * 0x100000000)) : (uint32_last + (uint32_first * 0x100000000));
};
MDF.ab2int64 = function(arrayBuffer, offset, littleEndian){
  var ans;
  var dataView = new DataView(arrayBuffer, offset, 8);
  if(littleEndian){
    var uint32_first = dataView.getUint32(0, littleEndian);
    var int32_last = dataView.getInt32(4, littleEndian);
    ans = uint32_first + (int32_last * 0x100000000);
  }
  else {
    var int32_first = dataView.getInt32(0, littleEndian);
    var uint32_last = dataView.getUint32(4, littleEndian);
    ans = uint32_last + (int32_first * 0x100000000);
  }
  return ans;
};
MDF.ab2bool = function(arrayBuffer, offset, littleEndian){
  var dataView = new DataView(arrayBuffer, offset, 2);
  return (dataView.getUint16(0, littleEndian) != 0);
};
MDF.ab2float = function(arrayBuffer, offset, littleEndian){
  var dataView = new DataView(arrayBuffer, offset, 4);
  return dataView.getFloat32(0, littleEndian);
};
MDF.ab2double = function(arrayBuffer, offset, littleEndian){
  var dataView = new DataView(arrayBuffer, offset, 8);
  return dataView.getFloat64(0, littleEndian);
};

MDF.str2u8arr = function(str){
  var ary_u8 = new Uint8Array(str.length);
  for(var i = 0; i < str.length; i++){
    ary_u8[i] = str.charCodeAt(i);
  }
  return ary_u8;
};

// member functions
MDF.prototype.initiallize = function(arrayBuffer){
  var offset = 0;
  this.idBlock = new IDBlock(arrayBuffer, offset);

  var littleEndian = this.idBlock.isLittleEndian(); // (this.idBlock.defaultByteOrder == 0);

  offset = 64;
  this.hdBlock = new HDBlock(arrayBuffer, offset, littleEndian);

  offset = this.hdBlock.pFirstDGBlock;
  this.setDGBlocks(arrayBuffer, offset, littleEndian);
};

MDF.prototype.setDGBlocks = function(arrayBuffer, initialOffset, littleEndian){
  var offset = initialOffset;

  while(offset){
    var dg = new DGBlock(arrayBuffer, offset, littleEndian);
    this.dgBlocks.push(dg);
    offset = dg.pNextDGBlock;
  }

  for(var i = 0; i < this.dgBlocks.length; i++){
    var dg = this.dgBlocks[i];
    dg.readDataBlock(arrayBuffer, dg.pDataBlock, littleEndian);
  }
};
