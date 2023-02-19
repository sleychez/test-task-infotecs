//константы, которые используются более 1 раза сделаны глобальными
const tableTh = document.querySelectorAll('th'),
    table = document.querySelector('table'),
    tableBody = document.querySelector('tbody')
//функция для заполнения таблицы нужными данными
//about/4 для вывода примерно двух строк
let fillTable = (jsonData) => {
    localStorage.getItem('jsonData') ? '' : localStorage.setItem('jsonData', JSON.stringify(jsonData));
    const aboutInfo = document.querySelector('.table_about'),
        aboutInfoLength = aboutInfo.clientWidth,
        data = localStorage.getItem('jsonData') ? JSON.parse(localStorage.getItem('jsonData')) : jsonData
    tableBody.innerHTML = ''
    data.forEach((el) => {
        let myTr = document.createElement('tr')
        myTr.setAttribute('id', el.id)
        myTr.className = 'table_rows'
        myTr.innerHTML = `<td class="table_first_name _col">${el.name.firstName}</td>
            <td class="table_last_name _col">${el.name.lastName}</td>
            <td class="table_about _col">${el.about.slice(0, (aboutInfoLength / 4)) + '...'}</td>
            <td class="table_eye_color _col">${el.eyeColor}</td>`
        tableBody.appendChild(myTr)
        const td = myTr.querySelector('.table_eye_color')
        setEyeColor(td)
    })
}

//наложение события на заголовки с сортировкой отдельной колонки
let sortTable = () => {
    tableTh.forEach((th, n) => {
        th.addEventListener('click', () => {
            checkIfSelectedTh(n)
            if (!th.dataset.index || th.dataset.index === '-1') {
                th.setAttribute('data-index', 1)
            } else if (th.dataset.index === '1') {
                th.setAttribute('data-index', -1)
            }
            let data = th.dataset.index
            th.classList.add('selected')
            sortRows(n, data)
        })
    })
}

//функция для сортировки таблицы index - колонка, которую требуется отсортировать
let sortRows = (index, data) => {
    let sortedRows = Array.from(tableBody.rows)
        .sort((rowA, rowB) => rowA.cells[index].innerHTML > rowB.cells[index].innerHTML ? data : -data);

    tableBody.append(...sortedRows);
}

//функция, которая проверяет класс selected у заголовков таблицы и которая убирает его у невыбранных заголовков
let checkIfSelectedTh = (index) => {
    tableTh.forEach((th, n) => {
        if (th.classList.contains('selected') && n !== index) {
            th.classList.toggle('selected');
            th.removeAttribute('data-index')
        }
    })
}

//функция для редактирования таблицы
let editTable = () => {
    const form = document.querySelector('.form_wrapper'),
        input = document.querySelectorAll('input'),
        textArea = document.querySelector('textarea'),
        editButton = document.querySelector('.div_bttn_edit'),
        closeButton = document.querySelector('.div_bttn_close')
    let dataRow
    //вызов формы и передача данных в нее
    table.addEventListener('click', (event) => {
        const row = event.target.closest('.table_rows')
        if (!row) return;
        dataRow = row;
        form.style.cssText = `display: block;  top: ${row.offsetTop}px; left: ${row.offsetWidth + 20}px;`;
        input[0].value = row.cells[0].innerHTML
        input[1].value = row.cells[1].innerHTML
        textArea.value = row.cells[2].innerHTML.slice(0, row.cells[2].innerHTML.length - 3);
        input[2].value = row.cells[3].firstChild.innerHTML
    })
    //событие для внесения изменений в json файл при клике на кнопку редактирования
    editButton.addEventListener('click', () => {
        const jsonData = JSON.parse(localStorage.getItem('jsonData'));
        const editedRow = {
            id: dataRow.id,
            name: {
                firstName: input[0].value,
                lastName: input[1].value
            },
            phone: dataRow.phone,
            about: textArea.value,
            eyeColor: input[2].value
        }
        jsonData.forEach((item, n) => {
            if (item.id === dataRow.id) {
                jsonData.splice(n, 1, editedRow)
            }
        })
        localStorage.setItem('jsonData', JSON.stringify(jsonData));
        form.style = '';
        fillTable(jsonData);
        tableTh.forEach((th) => {
            if (th.classList.contains('selected'))
                th.classList.toggle('selected')
        })
    })
    //событие для закрытия окна формы
    closeButton.addEventListener('click', () => form.style = '')
}

//функция для смены надписи с цветом глаз на цветной блок - создается див, в который передается значение,
//после, значение ячейки с цветом зануляется и в неё аппендится див, далее - диву передается css свойство background-color
let setEyeColor = (td) => {
    const eyeColor = document.createElement('div')
    eyeColor.className = 'colored_eye'
    eyeColor.innerHTML = td.innerHTML
    td.innerHTML = ''
    td.append(eyeColor)
    td.firstChild.style.cssText = `background-color: ${td.firstChild.innerHTML}`
}
//функция для скрытия колонки
let hideColumn = () => {
    const hideButtons = document.querySelectorAll('.bttn_hidden')
    hideButtons.forEach((item,n)=>{
        item.addEventListener('click', ()=>{
            if(item.dataset.hidden === 'off'){
                item.setAttribute('data-hidden', 'on')
                item.innerHTML = 'Показать колонку ' + tableTh[n].textContent
                table.classList.add(`_hidden${n+1}`)
            } else if(item.dataset.hidden === 'on'){
                item.setAttribute('data-hidden', 'off')
                item.textContent = 'Скрыть колонку ' + tableTh[n].textContent
                table.classList.remove(`_hidden${n+1}`)
            }
        })
    })
}

//ответ на запрос json массива
fetch('./src/data.json')
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        fillTable(data)
        sortTable()
        editTable()
        hideColumn()
    })