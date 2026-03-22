$(document).ready(function () {
  const allTimezones = moment.tz.names();

  allTimezones.sort((a, b) => {
    const offsetA = moment.tz(a).utcOffset();
    const offsetB = moment.tz(b).utcOffset();
    return offsetA - offsetB;
  });

  const timezoneOptions = allTimezones.map(timezone => {
    const offset = moment.tz(timezone).format('Z');
    return `<option value="${timezone}">UTC${offset} ${timezone}</option>`;
  }).join('');

  $('#cycleStartTimezone').html(timezoneOptions);
  $('#cycleStartTimezone').val('Asia/Shanghai');

  flatpickr('#cycleStartDate', {
    defaultDate: moment().startOf('month').toDate(),
    dateFormat: 'Y-m-d',
    onChange: updateCycleStart
  });

  flatpickr('#cycleStartTime', {
    noCalendar: true,
    enableTime: true,
    dateFormat: 'H:i',
    time_24hr: true,
    defaultDate: '00:00',
    onChange: updateCycleStart
  });

  updateCycleStart();
  bindAutoUpdate();
  generateRule();

  function bindAutoUpdate() {
    $('#serverIds, #trafficType, #cycleUnit, #cycleInterval, #maxTraffic, #trafficUnit').on('input change', generateRule);
    $('#cycleStartTimezone').on('change', updateCycleStart);
  }

  function updateCycleStart() {
    const timezone = $('#cycleStartTimezone').val();
    const date = $('#cycleStartDate').val();
    const time = $('#cycleStartTime').val();

    if (!timezone || !date || !time) {
      $('#cycleStart').val('');
      generateRule();
      return;
    }

    const formattedDate = moment.tz(`${date} ${time}`, timezone).format();
    $('#cycleStart').val(formattedDate);
    generateRule();
  }

  $('#cycleStart').on('input', function () {
    $(this).val(moment.tz(
      `${$('#cycleStartDate').val()} ${$('#cycleStartTime').val()}`,
      $('#cycleStartTimezone').val()
    ).format());
  });

  $('#generateRuleBtn').click(generateRule);

  function generateRule() {
    const serverIds = $('#serverIds').val()
      .split(',')
      .map(id => id.trim())
      .filter(Boolean);
    const cycleStart = $('#cycleStart').val();
    const trafficType = $('#trafficType').val();
    const cycleUnit = $('#cycleUnit').val();
    const cycleInterval = parseInt($('#cycleInterval').val(), 10);
    const maxTrafficInput = parseFloat($('#maxTraffic').val());
    const trafficUnit = parseInt($('#trafficUnit').val(), 10);
    const maxTraffic = maxTrafficInput * trafficUnit;

    if (!validateInput(serverIds, cycleStart, trafficType, cycleUnit, cycleInterval, maxTraffic)) {
      renderOutput('// 请完善上方配置，JSON 规则会自动更新');
      return;
    }

    const rule = [{
      type: trafficType,
      max: maxTraffic,
      cycle_start: cycleStart,
      cycle_interval: cycleInterval,
      cycle_unit: cycleUnit,
      cover: 1,
      ignore: serverIds.reduce((obj, id) => {
        obj[id] = true;
        return obj;
      }, {})
    }];

    renderOutput(JSON.stringify(rule, null, 2));
  }

  function renderOutput(content) {
    const output = document.getElementById('ruleOutput');
    output.textContent = content;
    hljs.highlightElement(output);
  }

  $('#copyRuleBtn').click(function () {
    const content = document.getElementById('ruleOutput').textContent;
    if (!content || content.startsWith('//')) {
      showModal('请先完成配置并生成有效的 JSON 规则');
      return;
    }

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(content)
        .then(() => showModal('JSON 规则已复制到剪贴板'))
        .catch(() => fallbackCopy(content));
      return;
    }

    fallbackCopy(content);
  });

  function fallbackCopy(content) {
    const temp = document.createElement('textarea');
    temp.value = content;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    document.body.removeChild(temp);
    showModal('JSON 规则已复制到剪贴板');
  }

  function validateInput(serverIds, cycleStart, trafficType, cycleUnit, cycleInterval, maxTraffic) {
    if (serverIds.length === 0) return false;
    if (!cycleStart) return false;
    if (!trafficType) return false;
    if (!cycleUnit) return false;
    if (isNaN(cycleInterval) || cycleInterval <= 0) return false;
    if (isNaN(maxTraffic) || maxTraffic <= 0) return false;
    return true;
  }

  function showModal(message) {
    $('#errorMessage').text(message);
    $('#errorModal').modal('show');
  }
});
