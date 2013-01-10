var Queuemetrics = require('../index');
var mysql = require('mysql');

var params = {
  host: '',
  username: '',
  password: '',
  port: 8080,
  path: '/queuemetrics/xmlrpc.do'
};
var queuemetrics = new Queuemetrics(params);

var newMysql = function(){
  return new mysql.createClient({
    user: '',
    password: '',
    database : '',
    host : ''
  });
}

var getQueues = function(group, callback){
  var mysqlclient = newMysql();
  mysqlclient.query( 'SELECT composizione_coda FROM code_possibili WHERE nome_coda = "' + group + '"', function (err, results, fields) {
    if(err){
      return false;
    }
    mysqlclient.end();
    callback(results[0]['composizione_coda']);
  });
}

getQueues('001_Data', function (data){
  var statsParams = {
    queues: data,
    startDate: new Date('2012-03-31 09:00:00'),
    endDate: new Date('2012-03-31 18:00:00'),
    filter: '',
    returnFields : ['OkDO.RiassAllCalls', 'KoDO.ReportKoAll','OkDO.ServiceLevelAgreement', 'OkDO.AnsweredcallsByDirection']
  };

  queuemetrics.getStats(statsParams, function(data){
    //do nothing
    console.log(data);
  });
});
//var ins = getQueues('007_Data');
//var sb = getQueues('007_Qmax');