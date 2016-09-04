/* Signal data type
 * Note: for 0-3 the default Byte order defined in IDBLOCK is used,
 * for 9-16 the default Byte order is overruled!
 * --------------------------------------------------------------------
 * 0 = unsigned integer                                 | Default Byte
 * 1 = signed integer (two's complement)                | order from
 * 2 = IEEE 754 floating-point format FLOAT (4 bytes)   | IDBLOCK
 * 3 = IEEE 754 floating-point format DOUBLE (8 bytes)  |
 * --------------------------------------------------------------------
 * 4 = VAX floating-point format (F_Float)              |
 * 5 = VAX floating-point format (G_Float)              | obsolete
 * 6 = VAX floating-point format (D_Float)              |
 * --------------------------------------------------------------------
 * 7 = String (NULL terminated)
 * 8 = Byte Array (max. 8191 Bytes, constant record length!)
 * --------------------------------------------------------------------
 * 9 = unsigned integer                                 | Big Endian
 * 10 = signed integer (twofs complement)              | (Motorola)
 * 11 = IEEE 754 floating-point format FLOAT (4 bytes)  | Byte order
 * 12 = IEEE 754 floating-point format DOUBLE (8 bytes) |
 * --------------------------------------------------------------------
 * 13 = unsigned integer                                | Little Endian
 * 14 = signed integer (twofs complement)              | (Intel)
 * 15 = IEEE 754 floating-point format FLOAT (4 bytes)  | Byte order
 * 16 = IEEE 754 floating-point format DOUBLE (8 bytes) |
 * --------------------------------------------------------------------
 */

CNBlock = function(arrayBuffer, blockOffset, littleEndian){
  this.blockTypeIdentifier = null;
  this.blockSize = null;
  this.pNextCNBlock = null;
  this.pCCBlock = null;
  this.pCEBlock = null;
  this.pCDBlock = null;
  this.pComment = null;
  this.channelType = null;
  this.shortSignalName = null;
  this.signalDescription = null;
  this.startOffsetInBits = null;
  this.numberOfBits = null;
  this.signalDataType = null;
  this.valueRangeValid = null;
  this.minSignalValue = null;
  this.maxSignalValue = null;
  this.samplingRate = null;

  this.pLongSignalName = null;
  this.pDisplayName = null;
  this.additionalByteOffset = null;

  this.pThisBlock = blockOffset;
  this.ccBlock = null;
  this.ceBlock = null;
  this.cdBlock = null;
  this.comment = null;

  this.rawDataArray = [];

  this.initiallize(arrayBuffer, blockOffset, littleEndian);
};

CNBlock.prototype.initiallize = function(arrayBuffer, blockOffset, littleEndian){
  var offset = blockOffset;
  var len;

  len = 2;
  this.blockTypeIdentifier = MDF.ab2str(arrayBuffer, offset, len);
  offset += len;

  len = 2;
  this.blockSize = MDF.ab2uint16(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 4;
  this.pNextCNBlock = MDF.ab2uint32(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 4;
  this.pCCBlock = MDF.ab2uint32(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 4;
  this.pCEBlock = MDF.ab2uint32(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 4;
  this.pCDBlock = MDF.ab2uint32(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 4;
  this.pComment = MDF.ab2uint32(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 2;
  this.channelType = MDF.ab2uint16(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 32;
  this.shortSignalName = MDF.ab2str(arrayBuffer, offset, len);
  offset += len;

  len = 128;
  this.signalDescription = MDF.ab2str(arrayBuffer, offset, len);
  offset += len;

  len = 2;
  this.startOffsetInBits = MDF.ab2uint16(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 2;
  this.numberOfBits = MDF.ab2uint16(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 2;
  this.signalDataType = MDF.ab2uint16(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 2;
  this.valueRangeValid = MDF.ab2bool(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 8;
  this.minSignalValue = MDF.ab2double(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 8;
  this.maxSignalValue = MDF.ab2double(arrayBuffer, offset, littleEndian);
  offset += len;

  len = 8;
  this.samplingRate = MDF.ab2double(arrayBuffer, offset, littleEndian);
  offset += len;

  if( this.blockSize > (offset - blockOffset) ){
    len = 4;
    this.pLongSignalName = MDF.ab2uint32(arrayBuffer, offset, littleEndian);
    offset += len;
  }

  if( this.blockSize > (offset - blockOffset) ){
    len = 4;
    this.pDisplayName = MDF.ab2uint32(arrayBuffer, offset, littleEndian);
    offset += len;
  }

  if( this.blockSize > (offset - blockOffset) ){
    len = 2;
    this.additionalByteOffset = MDF.ab2uint16(arrayBuffer, offset, littleEndian);
    offset += len;
  }

  if(this.pCCBlock != 0)  this.ccBlock = new CCBlock(arrayBuffer, this.pCCBlock, littleEndian);
  if(this.pCEBlock != 0)  this.ceBlock = new CEBlock(arrayBuffer, this.pCEBlock, littleEndian);
  if(this.pCDBlock != 0)  this.cdBlock = new CDBlock(arrayBuffer, this.pCDBlock, littleEndian);
  if(this.pComment != 0)  this.comment = new TXBlock(arrayBuffer, this.pComment, littleEndian);


  // method override
  this.readRawData = (function(littleEndianDefault){
    if(this.isUint()){
      var thisByteOffset = this.byteOffset();
      var thisBitOffset = this.bitOffset();
      var cnLittleEndian = (this.isDefaultByteOrder() == false) ? this.isLittleEndian() : littleEndianDefault;

      var byteLength = Math.ceil((thisBitOffset + this.numberOfBits) / 8);
      var bitmask = 0xFF >>> ((8 - ((thisBitOffset + this.numberOfBits) % 8)) % 8);

      if(thisBitOffset == 0){
        switch(this.numberOfBits){
        case 8:
          return function(arrayBuffer, recordOffset){
            var theOffset = recordOffset + thisByteOffset;
            return MDF.ab2uint8(arrayBuffer, theOffset);
          };
          break;
        case 16:
          return function(arrayBuffer, recordOffset){
            var theOffset = recordOffset + thisByteOffset;
            return MDF.ab2uint16(arrayBuffer, theOffset, cnLittleEndian);
          };
          break;
        case 32:
          return function(arrayBuffer, recordOffset){
            var theOffset = recordOffset + thisByteOffset;
            return MDF.ab2uint32(arrayBuffer, theOffset, cnLittleEndian);
          };
          break;
        case 64:
          return function(arrayBuffer, recordOffset){
            var theOffset = recordOffset + thisByteOffset;
            return MDF.ab2uint64(arrayBuffer, theOffset, cnLittleEndian);
          };
          break;
        default:
          if(this.numberOfBits < 8){
            return function(arrayBuffer, recordOffset){
              var theOffset = recordOffset + thisByteOffset;
              return bitmask & MDF.ab2uint8(arrayBuffer, theOffset);
            };
          }
          break;
        }
      }

      if(cnLittleEndian == false){
        return function(arrayBuffer, recordOffset){
          var theOffset = recordOffset + thisByteOffset;

          var uint8Array = MDF.ab2bytes(arrayBuffer, theOffset, byteLength);

          var ans = 0;
          var i;
          var index = uint8Array.length - 1;
          for(i = 0; i < uint8Array.length - 1; i++){
            ans += uint8Array[index] * Math.pow(2, 8 * i - thisBitOffset);
            index--;
          }
          var maskedVal = uint8Array[index] & bitmask;  // uint8Array[index] == MSB byte.
          ans += maskedVal * Math.pow(2, 8 * i - thisBitOffset);

          return ans;
        };
      }
      else {
        return function(arrayBuffer, recordOffset){
          var theOffset = recordOffset + thisByteOffset;

          var uint8Array = MDF.ab2bytes(arrayBuffer, theOffset, byteLength);

          var ans = 0;
          var i;
          for(i = 0; i < uint8Array.length - 1; i++){
            ans += uint8Array[i] * Math.pow(2, 8 * i - thisBitOffset);
          }
          var maskedVal = uint8Array[i] & bitmask;  // uint8Array[index] == MSB byte.
          ans += maskedVal * Math.pow(2, 8 * i - thisBitOffset);

          return ans;
        };
      }
    }
    else if(this.isInt()){
      var thisByteOffset = this.byteOffset();
      var thisBitOffset = this.bitOffset();
      var cnLittleEndian = (this.isDefaultByteOrder() == false) ? this.isLittleEndian() : littleEndianDefault;

      var byteLength = Math.ceil((this.bitOffset() + this.numberOfBits) / 8);
      var bitmask = 0xFF >>> ((8 - ((this.bitOffset() + this.numberOfBits) % 8)) % 8);

      if(thisBitOffset == 0){
        switch(this.numberOfBits){
        case 8:
          return function(arrayBuffer, recordOffset){
            var theOffset = recordOffset + thisByteOffset;
            return MDF.ab2int8(arrayBuffer, theOffset);
          };
          break;
        case 16:
          return function(arrayBuffer, recordOffset){
            var theOffset = recordOffset + thisByteOffset;
            return MDF.ab2int16(arrayBuffer, theOffset, cnLittleEndian);
          };
          break;
        case 32:
          return function(arrayBuffer, recordOffset){
            var theOffset = recordOffset + thisByteOffset;
            return MDF.ab2int32(arrayBuffer, theOffset, cnLittleEndian);
          };
          break;
        case 64:
          return function(arrayBuffer, recordOffset){
            var theOffset = recordOffset + thisByteOffset;
            return MDF.ab2int64(arrayBuffer, theOffset, cnLittleEndian);
          };
          break;
        default:
          if(this.numberOfBits < 8){
            return function(arrayBuffer, recordOffset){
              var theOffset = recordOffset + thisByteOffset;
              var maskedVal = bitmask & MDF.ab2uint8(arrayBuffer, theOffset);
              var flag = (bitmask ^ (bitmask >>> 1)) & maskedVal;
              var flaggedVal = (flag == 0) ? maskedVal : (maskedVal - bitmask - 1);
              return flaggedVal;
            };
          }
          break;
        }
      }

      if(cnLittleEndian == false){
        return function(arrayBuffer, recordOffset){
          var theOffset = recordOffset + thisByteOffset;

          var uint8Array = MDF.ab2bytes(arrayBuffer, theOffset, byteLength);

          var ans = 0;
          var i;
          var index = uint8Array.length - 1;
          for(i = 0; i < uint8Array.length - 1; i++){
            ans += uint8Array[index] * Math.pow(2, 8 * i - thisBitOffset);
            index--;
          }
          var maskedVal = uint8Array[index] & bitmask;  // uint8Array[index] == MSB byte.
          var flag = (bitmask ^ (bitmask >>> 1)) & maskedVal;
          var flaggedVal = (flag == 0) ? maskedVal : (maskedVal - bitmask - 1);
          ans += flaggedVal * Math.pow(2, 8 * i - thisBitOffset);

          return ans;
        };
      }
      else {
        return function(arrayBuffer, recordOffset){
          var theOffset = recordOffset + thisByteOffset;

          var uint8Array = MDF.ab2bytes(arrayBuffer, theOffset, byteLength);

          var ans = 0;
          var i;
          for(i = 0; i < uint8Array.length - 1; i++){
            ans += uint8Array[i] * Math.pow(2, 8 * i - thisBitOffset);
          }
          var maskedVal = uint8Array[i] & bitmask;  // uint8Array[index] == MSB byte.
          var flag = (bitmask ^ (bitmask >>> 1)) & maskedVal;
          var flaggedVal = (flag == 0) ? maskedVal : (maskedVal - bitmask - 1);
          ans += flaggedVal * Math.pow(2, 8 * i - thisBitOffset);

          return ans;
        };
      }
    }
    else if(this.isFloat()){
      var thisByteOffset = this.byteOffset();
      var cnLittleEndian = (this.isDefaultByteOrder() == false) ? this.isLittleEndian() : littleEndianDefault;

      return function(arrayBuffer, recordOffset){
        var theOffset = recordOffset + thisByteOffset;
        return MDF.ab2float(arrayBuffer, theOffset, cnLittleEndian);
      };
    }
    else if(this.isDouble()){
      var thisByteOffset = this.byteOffset();
      var cnLittleEndian = (this.isDefaultByteOrder() == false) ? this.isLittleEndian() : littleEndianDefault;

      return function(arrayBuffer, recordOffset){
        var theOffset = recordOffset + thisByteOffset;
        return MDF.ab2double(arrayBuffer, theOffset, cnLittleEndian);
      };
    }
    else if(this.isString()){
      var thisByteOffset = this.byteOffset();
      var theLen = this.numberOfBits / 8;

      return function(arrayBuffer, recordOffset){
        var theOffset = recordOffset + thisByteOffset;
        return MDF.ab2str(arrayBuffer, theOffset, theLen);
      };
    }
    else if(this.isByteArray()){
      var thisByteOffset = this.byteOffset();
      var theLen = this.numberOfBits / 8;

      return function(arrayBuffer, recordOffset){
        var theOffset = recordOffset + thisByteOffset;
        return MDF.ab2bytes(arrayBuffer, theOffset, theLen);
      };
    }

    // if the signal data type is invalid
    return this.readRawData;   // return original (dummy) function

  }).call(this, littleEndian);
};

CNBlock.prototype.isTimeChannel = function(){
  var ans = null;
  if(this && this.channelType != null) ans = (this.channelType == 1);
  return ans;
};

CNBlock.prototype.byteOffset = function(){
  var ans = parseInt(this.startOffsetInBits / 8);
  if(this.additionalByteOffset != null) ans += this.additionalByteOffset;
  return ans;
};

CNBlock.prototype.bitOffset = function(){
  var ans = this.startOffsetInBits % 8;
  return ans;
};

CNBlock.prototype.isUint = function(){
  var ans = null;
  if(this.signalDataType != null){
    ans = (this.signalDataType == 0 || this.signalDataType == 9 || this.signalDataType == 13);
  }
  return ans;
};

CNBlock.prototype.isInt = function(){
  var ans = null;
  if(this.signalDataType != null){
    ans = (this.signalDataType == 1 || this.signalDataType == 10 || this.signalDataType == 14);
  }
  return ans;
};

CNBlock.prototype.isFloat = function(){
  var ans = null;
  if(this.signalDataType != null){
    ans = (this.signalDataType == 2 || this.signalDataType == 11 || this.signalDataType == 15);
  }
  return ans;
};

CNBlock.prototype.isDouble = function(){
  var ans = null;
  if(this.signalDataType != null){
    ans = (this.signalDataType == 3 || this.signalDataType == 12 || this.signalDataType == 16);
  }
  return ans;
};

CNBlock.prototype.isString = function(){
  var ans = null;
  if(this.signalDataType != null){
    ans = (this.signalDataType == 7);
  }
  return ans;
};

CNBlock.prototype.isByteArray = function(){
  var ans = null;
  if(this.signalDataType != null){
    ans = (this.signalDataType == 8);
  }
  return ans;
};

CNBlock.prototype.isDefaultByteOrder = function(){
  var ans = null;
  if(this.signalDataType != null){
    ans = (this.signalDataType == 0 || this.signalDataType == 1 || this.signalDataType == 2 || this.signalDataType == 3);
  }
  return ans;
};

CNBlock.prototype.isBigEndian = function(){
  var ans = null;
  if(this.signalDataType == 9 || this.signalDataType == 10 || this.signalDataType == 11 || this.signalDataType == 12){
    ans = true;
  }
  else if(this.signalDataType == 13 || this.signalDataType == 14 || this.signalDataType == 15 || this.signalDataType == 16){
    ans = false;
  }
  return ans;
};

CNBlock.prototype.isLittleEndian = function(){
  var ans = null;
  if(this.signalDataType == 9 || this.signalDataType == 10 || this.signalDataType == 11 || this.signalDataType == 12){
    ans = false;
  }
  else if(this.signalDataType == 13 || this.signalDataType == 14 || this.signalDataType == 15 || this.signalDataType == 16){
    ans = true;
  }
  return ans;
};

// This is dummy function to advoid undefined error.
CNBlock.prototype.readRawData = function(arrayBuffer, recordOffset){
  return null;
};

CNBlock.prototype.pushRawData = function(arrayBuffer, recordOffset){
  var rawData = this.readRawData(arrayBuffer, recordOffset);

  var arrayLength = this.rawDataArray.push(rawData);
  return arrayLength;
};
