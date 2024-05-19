require("dotenv").config();
const {
  Bot,
  GrammyError,
  HttpError,
  Keyboard,
  InlineKeyboard,
} = require("grammy");
// плагин hydrate для интерактивного меню
const { hydrate } = require("@grammyjs/hydrate");

const bot = new Bot(process.env.BOT_API_KEY);
bot.use(hydrate()); // запуск плагина hydrate

// ***КОМАНДЫ***
// (без больших букв "кэмелКейс")
bot.api.setMyCommands([
  {
    command: "start",
    description: "start bot",
  },
  {
    command: "say_hi",
    description: "Приветствие от бота",
  },
  {
    command: "mood",
    description: "Узнать настроение",
  },
  {
    command: "share",
    description: "Представить данные о себе",
  },
  {
    command: "inline_keyboard",
    description: "Выбрать цифорку",
  },
  {
    command: "menu_hydrate",
    description: "Интерактивное меню",
  },
]);

// * ответ бота на команду '/start'
bot.command("start", async (ctx) => {
  await ctx.reply("Hi, я бот на грэми");
});
// * ответ бота на массив команд
bot.command(["hello", "say_hi", "say_hello"], async (ctx) => {
  await ctx.reply("Hi, ответил на массив команд");
});

// * ответ бота на любое сообщение, если не было ответа с других обработчиков
bot.on("message", async (ctx) => {
  await ctx.reply("... ответил на любое сообщение");
});
// * message:photo :text :voice :url (message - можно опустить)
// * :media - заменяет фото/видео, можно передать [':media', "::url"]
bot.on(":voice", async (ctx) => {
  await ctx.reply("... ответил на голосовое сообщение");
});
// * message:entities:photo ::text ::voice  (message:entities - можно опустить)
// * вычлиняет из текста, если есть ссылка/голосовое и т.д.
bot.on("::url", async (ctx) => {
  await ctx.reply("... ответил на текст, содержащий ссылку ");
});
// * применяем фильтр, если первый колбэк true, значит выполнится второй
bot.on("msg").filter(
  (ctx) => {
    return ctx.from.id === 986453198;
  },
  async (ctx) => {
    await ctx.reply(`Привет, Адмэн "${ctx.from.first_name}"`);
  }
);

// * ответ на определенное сообщение, либо на массив сообщений
bot.hears("лол", async (ctx) => {
  await ctx.reply("кек");
});
// // * можно передавать регулярку (найдет если в тексте есть слово "хер")
bot.hears(/лох/, async (ctx) => {
  await ctx.reply("не ругайся");
});
// // * передать чтобы удовлетворял всем условиям (оператор 'И')
bot.on("::url").on(":photo", async (ctx) => {
  await ctx.reply("... ответил на голосовое сообщение");
});

// ********ДОП ПАРАМЕТРЫ*** (форматирование текста/ответ на сообщение)
// ответ бота на сообщение
bot.on("msg", async (ctx) => {
  await ctx.reply("Ответ на любое сообщение", {
    reply_parameters: { message_id: ctx.msg.message_id },
  });
});
// * форматирование текста (HTML, markdown)
// * <b> - жирный, <a> - курсив
bot.on("msg", async (ctx) => {
  await ctx.reply(
    "Ответ на любое сообщение <a href='https://t.me/Saint_AM'>моя ссылка в тг</a>",
    {
      parse_mode: "HTML",
    }
  );
});
bot.on("msg", async (ctx) => {
  await ctx.reply(
    "Ответ на любое сообщение <span class='tg-spoiler'>спойлер под дымком)</span>",
    {
      parse_mode: "HTML",
    }
  );
});
// * marakdownV2
bot.on("msg", async (ctx) => {
  await ctx.react("❤"); // реакция бота на наше сообщение
  await ctx.reply(
    "Ответ на любое сообщение\\. *жирный* _курсив_ [это ссылка](https://t.me/Saint_AM)",
    {
      parse_mode: "MarkdownV2",
      link_preview_options: { is_disabled: true }, // скрываем preview ссылки
    }
  );
});


// ***СОЗДАНИЕ KEYBOARD КНОПКИ****
// * на команду /mood выскочит вместо клавитуры три кнопки
bot.command("mood", async (ctx) => {
  const moodKeyboard = new Keyboard()
    .text("Good")
    .row()
    .text("Normal")
    .row()
    .text("Badly")
    .resized();
  // .oneTime();
  await ctx.reply("Как настроение?", {
    reply_markup: moodKeyboard,
  });
});
// // Отвечаем на команду, и скрываем remove keyboard (клавиатуру)
bot.hears("Normal", async (ctx) => {
  await ctx.reply("хорошее настроение)", {
    reply_markup: { remove_keyboard: true },
  });
});
// * второй способ создания KEYBOARD КНОПКИ
bot.command("mood", async (ctx) => {
  const moodLabels = ["xорошо", "норм", "плохо"];
  const rows = moodLabels.map((label) => {
    return [Keyboard.text(label)];
  });
  const moodKeyboard2 = Keyboard.from(rows).resized();
  await ctx.reply("Как настроение?", {
    reply_markup: moodKeyboard2,
  });
});
// * создание команды что бы поделится контактами, локацией и опрос
// * меняем placeholder в клавиатуре
bot.command("share", async (ctx) => {
  const shareKeyboard = new Keyboard()
    .requestLocation("Геолокация")
    .requestContact("Контакты")
    .requestPoll("Опрос")
    .placeholder("Укажите данные...")
    .resized();
  await ctx.reply("Чем хочешь поделится?", {
    reply_markup: shareKeyboard,
  });
});
bot.on(":contact", async (ctx) => {
  await ctx.reply("<span class='tg-spoiler'>спасибо за данные)</span>", {
    parse_mode: "HTML",
  });
});


// *****СОЗДАНИЕ INLINE KEYBOARD*****
bot.command("inline_keyboard", async (ctx) => {
  const inlineKeyboard = new InlineKeyboard()
    .text("1", "button-1")
    .row()
    .text("2", "button-2")
    .row()
    .text("3", "button-3");
  const inlineKeyboard2 = new InlineKeyboard().url(
    "Перейти к Саньку в тг",
    "https://t.me/Saint_AM"
  );
  await ctx.reply("Нажми на цифру", {
    reply_markup: inlineKeyboard,
  });
  await ctx.reply("Нажми на цифру", {
    reply_markup: inlineKeyboard2,
  });
});
// bot.callbackQuery(/button-[1-3]/, async (ctx) => {
bot.callbackQuery(["button-1", "button-2", "button-3"], async (ctx) => {
  await ctx.reply(`Вы выбрали цифру: ${ctx.callbackQuery.data.slice(-1)}`);
  await ctx.answerCallbackQuery(`Спасибо!`);
});


// ****Создание INLINE KEYBOARD c плагином hydrate*****
const menuKeyboardHydrate = new InlineKeyboard()
  .text("Узнать статус заказа", "status")
  .text("Обратится в поддержку", "support");
const backKeyboardHydrate = new InlineKeyboard().text("< Назад в меню", "back");
bot.command("menu_hydrate", async (ctx) => {
  await ctx.reply("Выберите пункт меню", {
    reply_markup: menuKeyboardHydrate,
  });
});
// обработчик для кнопок
bot.callbackQuery("status", async (ctx) => {
  await ctx.callbackQuery.message.editText("Статус заказа в пути", {
    reply_markup: backKeyboardHydrate,
  });
  await ctx.answerCallbackQuery();
});
// обработка кнопки "назад в меню"
bot.callbackQuery("back", async (ctx) => {
  await ctx.callbackQuery.message.editText("Выберите пункт меню", {
    reply_markup: menuKeyboardHydrate,
  });
  await ctx.answerCallbackQuery();
});



// ***ОБРАБОТКА ОШИБОК***
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});

// запуск бота
bot.start();
