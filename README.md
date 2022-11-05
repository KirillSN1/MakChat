# matcha/server
Makeevka True Chat
https://github.com/KirillSN1/matcha-server.git
# Сайт: [перейти](https://makchat.herokuapp.com/){:target="_blank"}



# Описание core/build_scipts
В этой директории хранятся скрипты сборки и запуска приложения
<br>
    <b>core/build_scipts/scripts</b>:
<br>
<ul>
    <li>core/build_scipts/scripts/dev.ts - сборка и запуск.</li>
    <li>core/build_scipts/scripts/watch.ts - аналогично предыдущему, но в добавок ещё и отслеживает изменения в проекте (в файлах *ts)</li>
</ul>

# Пример package.json
```json
{
    "scripts": {
        "start": "node .", //запуск скомпилированного кода
        "build": "tsc", //компиляция кода
        "dev":"ts-node ./core/build_scripts/scripts/dev.ts --build",
        "watch": "ts-node ./core/build_scripts/scripts/watch.ts"
    },
    "dependencies": {
        "findit": "^2.0.0",//зависимость необходимя для скрипта watch.ts
    },
}
```
ВНИМАНИЕ: Скрипты <b>dev</b> и <b>watch</b> используют скрипты <b>start</b> и <b>build</b> для сборки и запуска, так что они обязательно должны присутствовать в проекте.