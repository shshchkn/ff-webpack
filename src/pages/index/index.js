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

function dnd(params) {
    if (params.from) {
        [].forEach.call(params.from, el => {
            el.addEventListener('dragstart', dragStart);
        });
    }

    function dragStart(e) {
        e.dataTransfer.dropEffect = 'move';
        e.dataTransfer.setData('text', e.target.getAttribute('id'));
    }

    if (params.to) {
        params.to.addEventListener('dragenter', dragEnter);
        params.to.addEventListener('dragleave', dragLeave);
        params.to.addEventListener('dragover', dragOver);
        params.to.addEventListener('drop', dragDrop);
        params.to.addEventListener('dragend', sortList(params.arr2));



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
            if (params.to) {
                let elemID = e.dataTransfer.getData('text'),
                    elem = document.getElementById(elemID),
                    button = elem.querySelector('.fa');


                button.className = 'fa fa-' + params.cls;
                button.parentNode.id = params.id;
                params.to.appendChild(elem);

                for (let i = 0; i < params.arr1.length; i++) {
                    if (params.arr1[i].id === Number(elemID)) {
                        params.arr2.push(params.arr1[i]);
                        params.arr1.splice(i, 1);
                    }
                }

                if (params.search.value !== '') {
                    params.search.value = '';
                    let search = new Event('keyup');
                    params.search.dispatchEvent(search);
                }
            }
        }
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

function btnAction(e, params) {
    let item = e.target.closest('li');

    params.list.appendChild(item);
    e.target.parentNode.remove();

    let close = document.createElement('i'),
        btn = document.createElement('button');

    close.className = `fa fa-${params.icon}`;
    item.appendChild(btn);
    btn.appendChild(close);

    for (let i = 0; i < params.arr1.length; i++) {
        if (params.arr1[i].id === Number(item.id)) {
            params.arr2.push(params.arr1[i]);
            params.arr1.splice(i, 1);
        }
    }

    if (params.search.value !== '') {
        params.search.value = '';
        let search = new Event('keyup');
        params.search.dispatchEvent(search);
    }
}

const promise = new Promise((resolve, reject) => {
    VK.init({
        apiId: 6200015
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

        return api('friends.get', {v: 5.68, fields: 'first_name, last_name, photo_50', count: 30});
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

        let dndToRight = {
            from: allFriends.children,
            to: listFriends,
            arr1: leftCol,
            arr2: rightCol,
            cls: 'close',
            id: 'btnDel',
            search: rightSearch,
            tpl: 'rightTemplate'
        };

        let dndToLeft = {
            from: listFriends.children,
            to: allFriends,
            arr1: rightCol,
            arr2: leftCol,
            cls: 'plus',
            id: 'btnAdd',
            search: leftSearch,
            tpl: 'leftTemplate'
        };

        dnd(dndToRight);
        dnd(dndToLeft);

        document.body.addEventListener('click', (e) => {
            e.preventDefault();

            if (e.target.className === 'fa fa-plus'){
                let params = {
                    icon: 'close',
                    list: listFriends,
                    arr1: leftCol,
                    arr2: rightCol,
                    search: rightSearch
                };

                btnAction(e, params);
            }

            if (e.target.className === 'fa fa-close') {
                let params = {
                    icon: 'plus',
                    list: allFriends,
                    arr1: rightCol,
                    arr2: leftCol,
                    search: leftSearch
                };

                btnAction(e, params);
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

            dnd(dndToRight);
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

            dnd(dndToLeft);
        });

        let save = document.querySelector('.ff-footer__save');

        save.addEventListener('click', () => {
            localStorage.clear();
            localStorage.all = JSON.stringify(leftCol);
            localStorage.added = JSON.stringify(rightCol);
            alert('Данные сохранены!');
        });
    })
    .catch(e => {
        alert('Ошибка ' + e.message, e.name, e.stack);
    });