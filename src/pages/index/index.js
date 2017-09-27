import './index.scss';
import 'normalize.css';

function api(method, params) {
    return new Promise((resolve, reject) => {
        VK.api(method, params, data => {
            if (data.error) {
                reject(new Error(data.error.error_msg));
            } else {
                resolve(data.response);
            }
        });
    });
}

function isMatching(name, input) {
    return name.toLowerCase().includes(input.toLowerCase());
}

function dnd(objects, dropZone, col1, col2, btnClass, btnId) {
    if (objects) {
        [].forEach.call(objects, el => {
            el.addEventListener('dragstart', dragStart);
        });
    }

    if (dropZone) {
        dropZone.addEventListener('dragenter', dragEnter);
        dropZone.addEventListener('dragleave', dragLeave);
        dropZone.addEventListener('dragover', dragOver);
        dropZone.addEventListener('drop', dragDrop);
        dropZone.addEventListener('dragend', sortList(col2));
    }

    function dragStart(e) {
        e.dataTransfer.dropEffect = 'move';
        e.dataTransfer.setData('text', e.target.getAttribute('id'));

        return false;
    }

    function dragEnter(e) {
        e.preventDefault();
    }

    function dragLeave(e) {
        e.preventDefault();
    }

    function dragOver(e) {
        e.preventDefault();
    }

    function dragDrop(e) {
        e.preventDefault();

        let elemID = e.dataTransfer.getData('text'),
            elem = document.getElementById(elemID),
            button = elem.querySelector('.fa');

        if (dropZone) {
            button.className = 'fa fa-' + btnClass;
            button.parentNode.id = btnId;
            dropZone.appendChild(elem);
            for (let i = 0; i < col1.length; i++) {
                if (col1[i].id === Number(elemID)) {
                    col2.push(col1[i]);
                    col1.splice(i, 1);
                }
            }
        }

        return false;
    }
}

function createList(tpl, list, el) {
    sortList(tpl);

    let tplElement = document.querySelector(`#${el}`),
        source = tplElement.innerHTML,
        render = Handlebars.compile(source),
        template = render({output: tpl});

    list.innerHTML = template;
}

function sortList(obj) {
    obj.sort((prev, next) => {
        if (prev.first_name > next.first_name) {
            return 1;
        }

        if (prev.first_name < next.first_name) {
            return -1;
        }

        return 0;
    });
}

function btnAction(e, list, icon, col1, col2) {
    let item = e.target.closest('li');

    list.appendChild(item);
    e.target.parentNode.remove();

    let close = document.createElement('i'),
        btn = document.createElement('button');

    close.className = `fa fa-${icon}`;
    item.appendChild(btn);
    btn.appendChild(close);

    for (let i = 0; i < col1.length; i++) {
        if (col1[i].id === Number(item.id)) {
            col2.push(col1[i]);
            col1.splice(i, 1);
        }
    }
}

const promise = new Promise((resolve, reject) => {
    VK.init({
        apiId: 6191259
    });

    VK.Auth.login(data => {
        if (data.session) {
            console.log('Список друзей получен!');
            resolve(data);
        } else {
            console.log('Error');
            reject(new Error('Connection error!'));
        }
    });
});

promise
    .then(() => {

        return api('friends.get', {v: 5.68, fields: 'first_name, last_name, photo_50', count: 16});
    })
    .then(data => {
        let leftCol = [],
            rightCol = [],
            allFriends = document.getElementById('allFriends'),
            listFriends = document.getElementById('listFriends');

        let list = data.items;

        for (let item of list) {
            let friend = {
                id: item.id,
                first_name: item.first_name,
                last_name: item.last_name,
                img: item.photo_50
            };

            leftCol.push(friend);
        }

        if (localStorage.all && localStorage.added) {
            leftCol = JSON.parse(localStorage.all);
            rightCol = JSON.parse(localStorage.added);

            createList(leftCol, allFriends, 'leftTemplate');
            createList(rightCol, listFriends, 'rightTemplate');
        }

        createList(leftCol, allFriends, 'leftTemplate');
        createList(rightCol, listFriends, 'rightTemplate');

        dnd(allFriends.children, listFriends, leftCol, rightCol, 'close', 'btnDel');
        dnd(listFriends.children, allFriends, rightCol, leftCol, 'plus', 'btnAdd');

        document.body.addEventListener('click', (e) => {
            e.preventDefault();

            if (e.target.className === 'fa fa-plus'){
                btnAction(e, listFriends, 'close', leftCol, rightCol);
            }

            if (e.target.className === 'fa fa-close') {
                btnAction(e, allFriends, 'plus', rightCol, leftCol);
            }
        });

        leftSearch.addEventListener('keyup', () => {
            let val = leftSearch.value.trim();

            allFriends.innerHTML = '';

            if (val !== '') {
                for (let item of leftCol) {
                    if (isMatching(item.first_name, val) || isMatching(item.last_name, val)) {
                        allFriends.innerHTML += `<li id="${item.id}" draggable="true">
                                                    <img src="${item.img}"/>
                                                    <span>${item.first_name} ${item.last_name}</span>
                                                    <button id="btnAdd" type="button">
                                                        <i class="fa fa-plus"></i>
                                                    </button>
                                                 </li>`;
                    }
                }
            } else {
                createList(leftCol, allFriends, 'leftTemplate');
            }

            dnd(allFriends.children, listFriends, leftCol, rightCol, 'close', 'btnDel');
        });

        rightSearch.addEventListener('keyup', () => {
            let val = rightSearch.value.trim();

            listFriends.innerHTML = '';

            if (val !== '') {
                for (let item of rightCol) {
                    if (isMatching(item.first_name, val) || isMatching(item.last_name, val)) {
                        listFriends.innerHTML += `<li id="${item.id}" draggable="true">
                                                    <img src="${item.img}"/>
                                                    <span>${item.first_name} ${item.last_name}</span>
                                                    <button id="btnDel" type="button">
                                                        <i class="fa fa-close"></i>
                                                    </button>
                                                </li>`;
                    }
                }
            } else {
                createList(rightCol, listFriends, 'rightTemplate');
            }

            dnd(listFriends.children, allFriends, rightCol, leftCol, 'plus', 'btnAdd');
        });

        let save = document.querySelector('.ff-footer__save');

        save.addEventListener('click', () => {
            localStorage.all = JSON.stringify(leftCol);
            localStorage.added = JSON.stringify(rightCol);
            alert('Данные сохранены!');
        });
    })
    .catch(e => {
        alert('Ошибка ' + e.message, e.name, e.stack);
    });

