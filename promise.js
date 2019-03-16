'use strict';

const Botgram = require('botgram');
const request = require('request');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, prettyPrint } = format;
const logging = createLogger({
    format: combine(
        timestamp(),
        prettyPrint()
    ),
    transports: [
        new transports.File({ filename: 'logger.log' })
    ]
});
logging.info('Server Basladi');

const { <<TELEGRAM-BOT-TOKEN>> } = process.env;
const bot = new Botgram("<<TELEGRAM-BOT-TOKEN>>")

bot.command('start', function (msg, reply, next) {
    logging.info(`${msg.text} mesajı alındı ve isim gönderildi`);
    reply.text(`Merhaba ${msg.from.firstname}`+'\nNasıl yardımcı olabilirim');
    logging.info('Hosgeldin Mesajı Gonderildi');
  });
bot.text(function (msg, reply, next){
	new Promise(function(resolve,reject){
		resolve(msg.text.toLowerCase())
	}).then(msg => {
	  	if(msg.search('adım')===0 || msg.search('ismim')===0){
			reply.text(`Senin adın ${msg.from.firstname}`);
	  	}else{ return msg }
	  }).then(message => {
      const options = {
        url: 'http://beta.ceyd-a.com/jsonengine.jsp',
        method: 'POST',
        form: {
          'username': '<<CEYD-A-USERNAME>>',
          'token': '<<CEYD-A-TOKEN>>',
          'code': message,
        },
	    };
		request(options, function (err, res, body) {
	    let json = JSON.parse(body.slice(1, -3)).answer;
			if (json !== '') {
				if(json.search('Yeni adım artık')===0 || json.search('İsmim artık')===0){
					reply.text('Benim isimim TubitBot ve bunu değştirmene izin veremem. Beni böyle sev.')
					options.form.code ='Senin ismin TubitBot';
					request(options,function (err, res, body) {
						logging.info({'Name':`${msg.from.name}`,message:'İsim Koruyucu Çalıştı'});
					});
				}else{
					logging.info(`Ceyd-a ( ${json} ) cevabını verdi.`);
					reply.text(json);
				}
	    }else{
        reply.text('Ceyd-A API Beta sürümünde çalıştığı için bazı komutlarda eksilik var. Play Store dan tam sürümü indirip bu komutu tekrar deneyebilirsin.');
	      logging.info(json);
	       	}
	  	})
	  }).catch((err) => {
	  	reply.text('Bir hata oluştu ve bildirildi.');
	    logging.error({'Name': `${msg.from.name}`,message: 'Request hatası'});
	  });
	});
