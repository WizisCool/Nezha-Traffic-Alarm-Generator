$(document).ready(function () {
  // 获取所有时区
  const allTimezones = moment.tz.names();

  // 按 UTC 偏移量排序时区
  allTimezones.sort((a, b) => {
    const offsetA = moment.tz(a).utcOffset();
    const offsetB = moment.tz(b).utcOffset();
    return offsetA - offsetB;
  });

  // 生成时区选项
  const timezoneOptions = allTimezones.map(timezone => {
    const offset = moment.tz(timezone).format('Z');
    return `<option value="${timezone}">UTC${offset} ${timezone}</option>`;
  }).join('');


  $('#cycleStartTimezone').html(timezoneOptions);

  // 设置默认时区为 UTC+8 上海时间
  $('#cycleStartTimezone').val('Asia/Shanghai');

  // 初始化日期选择器
  const datePickr = flatpickr('#cycleStartDate', {
    defaultDate: moment().startOf('month').toDate(),
    dateFormat: 'Y-m-d',
    onChange: updateCycleStart
  });

  // 初始化时间选择器
  const timePickr = flatpickr('#cycleStartTime', {
    noCalendar: true,
    enableTime: true,
    dateFormat: 'H:i',
    time_24hr: true,
    defaultDate: '00:00',
    onChange: updateCycleStart
  });

  // 页面加载时生成初始的 RFC3339 和 规则
  updateCycleStart();
  generateRule();

  // 更新统计周期开始时间
  function updateCycleStart() {
    const timezone = $('#cycleStartTimezone').val();
    const date = $('#cycleStartDate').val();
    const time = $('#cycleStartTime').val();
    const formattedDate = moment.tz(`${date} ${time}`, timezone).format();
    $('#cycleStart').val(formattedDate);
    generateRule();
  }

  // 防止用户编辑 RFC3339 格式时间
  $('#cycleStart').on('input', function () {
    showErrorModal('请使用上方的时间选择器选择时间');
    $(this).val(moment.tz($('#cycleStartDate').val() + ' ' + $('#cycleStartTime').val(), $('#cycleStartTimezone').val()).format());
  });

  // 生成规则按钮
  $('#generateRuleBtn').click(generateRule);

  // 生成规则
  function generateRule() {
    const serverIds = $('#serverIds').val().split(',').map(id => id.trim());
    const cycleStart = $('#cycleStart').val();
    const trafficType = $('#trafficType').val();
    const cycleUnit = $('#cycleUnit').val();
    const cycleInterval = parseInt($('#cycleInterval').val());
    const maxTraffic = $('#maxTraffic').val() * $('#trafficUnit').val();

    if (!validateInput(serverIds, cycleStart, trafficType, cycleUnit, cycleInterval, maxTraffic)) {
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

    const ruleJson = JSON.stringify(rule, null, 2);
    $('#ruleOutput').text(ruleJson);
    hljs.highlightBlock(document.getElementById('ruleOutput'));
  }

  // 复制规则按钮
  $('#copyRuleBtn').click(function () {
    const ruleOutput = document.getElementById('ruleOutput');
    const range = document.createRange();
    range.selectNode(ruleOutput);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    showSuccessModal('JSON 规则已复制到剪贴板');
  });

  // 输入验证
  function validateInput(serverIds, cycleStart, trafficType, cycleUnit, cycleInterval, maxTraffic) {
    if (serverIds.length === 0 || (serverIds.length === 1 && serverIds[0] === '')) {
      showErrorModal('请输入服务器 ID');
      return false;
    }

    if (!cycleStart) {
      showErrorModal('请选择统计周期开始时间');
      return false;
    }

    if (!trafficType) {
      showErrorModal('请选择流量类型');
      return false;
    }

    if (!cycleUnit) {
      showErrorModal('请选择周期单位');
      return false;
    }

    if (isNaN(cycleInterval) || cycleInterval <= 0) {
      showErrorModal('请输入有效的周期间隔 (大于 0 的数字)');
      return false;
    }

    if (isNaN(maxTraffic) || maxTraffic <= 0) {
      showErrorModal('请输入有效的流量上限 (大于 0 的数字)');
      return false;
    }

    return true;
  }

  // 时区选择器变更事件
  $('#cycleStartTimezone').change(updateCycleStart);


  function showErrorModal(message) {
    $('#errorMessage').text(message);
    $('#errorModal').modal('show');
  }


  function showSuccessModal(message) {
    $('#errorMessage').text(message);
    $('#errorModal').modal('show');
  }
});