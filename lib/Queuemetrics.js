var xmlrpc = require('xmlrpc');

Date.prototype.getTwoDigitDate = function(){
  var date = this.getDate();
  return date < 10 ? ( '0' + date ) : date;
}

Date.prototype.getTwoDigitMonth = function(){
  var month = (this.getMonth() + 1);
  return month < 10 ? ( '0' + month ) : month;
}
Date.prototype.getTwoDigitHour = function(){
  var hour = (this.getHours() + 1);
  return hour < 10 ? ( '0' + hour ) : hour;
}
Date.prototype.getTwoDigitMinute = function(){
  var minute = this.getMinutes();
  return minute < 10 ? ( '0' + minute ) : minute;
}
Date.prototype.getTwoDigitSecond = function(){
  var second = this.getSeconds();
  return second < 10 ? ( '0' + second ) : second;
}

Date.prototype.toQueuemetrics = function(){
  return this.getFullYear() + '-' + this.getTwoDigitMonth() + '-' + this.getTwoDigitDate() + '.' + this.getTwoDigitHour() + ':' + this.getTwoDigitMinute() + ':' + this.getTwoDigitSecond();
}
var client;

module.exports = Queuemetrics;

function Queuemetrics(params){
  params = params || {};

  this.host = params.host || 'localhost';
  this.port = params.port || 80;
  this.path = params.path || '/';
  this.ssl = (params.ssl !== undefined) ? params.ssl : false;
  this.username = params.username || 'username';
  this.password = params.password || 'default';

  var clientOptions = {
    host: this.host,
    port: this.port,
    path: this.path
  };

  if(this.ssl){
    client = xmlrpc.createSecureClient(clientOptions);
  }else{
    client = xmlrpc.createClient(clientOptions);
  }
}

Queuemetrics.prototype.getStats = function(params, callback){
  /*
    params = {
      queues: '',
      startDate: Date(),
      endDate: Date(),
      filter: '',
      returnFields : []
    }
  */
  //make sure all required fields are present
  client.methodCall('QM.stats', [ params.queues, this.username, this.password, ''/*log filename*/, ''/*period*/, params.startDate.toQueuemetrics(), params.endDate.toQueuemetrics(), params.filter, params.returnFields ], function (error, tmp_data) {
    var data = {};

    console.log(tmp_data);
    params.returnFields.push('result');
    params.returnFields.forEach(function(a){
      data[a] = {};
      switch(a){
        case 'KoDO.ReportKoAll':
        case 'OkDO.RiassAllCalls':
        case 'result':
        case 'OkDO.RiassFullyWithin':
          tmp_data[a].forEach(function(b){
            data[a][b[0]] = b[1];
          })
        break;
        case 'OkDO.AgentsOnQueue':
        case 'OkDO.ServiceLevelAgreement':
        case 'OkDO.DisconnectionCauses':
        case 'OkDO.Transfers':
        case 'OkDO.AnsweredcallsByQueue':
        case 'OkDO.AnsweredcallsByDirection':
          var headers;
          tmp_data[a].forEach(function(b,c){
            if(c == 0){
              headers = b;
            }else{
              data[a][b[0]] = {};
              for(var i in b){
                if(i != 0 && headers[i] != '...'){
                  data[a][b[0]][headers[i]] = b[i];
                }
              }
            }
          })
        break;
        case 'OkDO.StintsOk':
        case 'OkDO.QPosOk':
        case 'OkDO.IvrOk':
        case 'OkDO.DnisOk':
        case 'OkDO.MOHOk':
        case 'not_implemented':
          data[a]['error'] = 'no_method_implemented';
        break;
        default:
           data[a]['error'] = 'no_method_in_case_statement';
        break;
      }
    })    
    callback(data);
  });
}
