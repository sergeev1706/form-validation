
const form = document.querySelector('#user-create-form');
const formError = document.querySelector('#user-create-form-error');
const spinner = document.querySelector('#spinner');
const infoMessage = document.querySelector('#info-message');

async function createUser(data) {
  const errors = [];

  if (!data.email) {
    errors.push({
      name: 'email',
      message: 'Поле E-mail обязательно для заполнения'
    })
  } else if (!data.email.includes('@') || !data.email.includes('.')) {
    errors.push({
      name: 'email',
      message: 'E-mail имеет неверный формат'
    })
  }

  if (!data.name.trim()) {
    errors.push({
      name: 'name',
      message: 'Имя обязательно для заполнения'
    })
  }

  if (!data.gender) {
    errors.push({
      name: 'gender',
      message: 'Пол обязателен для заполнения'
    })
  }

  if (!data.status) {
    errors.push({
      name: 'status',
      message: 'Статус обязателен для заполнения'
    })
  }

  if (errors.length) {
    const err = new TypeError();
    err.errorMessages = errors;
    throw err;
  }

  let responseСode;

  const response = await fetch('https://gorest.co.in/public/v2/users', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer tocen'
    }
  })
    .then(res => {
      responseСode = res.status;
      return res;
    })
    .then(res => res.json())

  if (responseСode === 200 || responseСode === 201) {
    return response;
  }

  // если статус-код не (200 или 201) в response попадает массив с ошибками
  // но с другими полями { field: 'email', message: 'has already been taken'}
  // и если в этом массиве что-то есть выбрасываем ошибку 
  // преобразуя ключи объекта в нужный нам формат
  if (response) {
    const err = new TypeError()
    err.errorMessages = response.map(err => ({
      name: err.field,
      message: err.message
    }))
    throw err;
  }

  // при возникновении неизвестной нам ошибки  
  throw new Error('Не удалось создать нового пользователя');
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {};  // объект с данными для отправки формы

  // объект инпутов с ключами 'name','email','gender','status'
  // и значениями соответствующими input 'name' 
  // для управления классами
  const inputs = {};

  for (let i = 0; i < form.elements.length; i++) {
    const input = form.elements[i];
    if (!input.name) continue;
    data[input.name] = input.value;            // в data с ключом(input.name) => значение(input.value)
    inputs[input.name] = input;                // в объект записываю новое свойство равное самому элементу input
    input.classList.remove('is-invalid');      // убираю класс невалидности
  }

  formError.textContent = '';

  try {
    spinner.style.display = '';
    await createUser(data);
  } catch (err) {

    if (err.name !== 'TypeError') throw err;

    // обработка ошибок при валидации
    if (err.errorMessages) {

      for (const errorMessage of err.errorMessages) {
        inputs[errorMessage.name].classList.add('is-invalid');
      }
      formError.textContent = err.errorMessages.map(error => error.message).join('. ');
    }
  } finally {
    // убираю спиннер
    spinner.style.display = 'none';
    // показываю сообщение об успехе и через две секунды убираю
    infoMessage.style.display = '';
    setInterval(() => { infoMessage.style.display = 'none' }, 2000);
  }
})