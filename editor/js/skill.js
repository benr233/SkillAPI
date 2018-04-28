/**
 * Represents the data for a dynamic skill
 *
 * @param {string} name - the name of the skill
 *
 * @constructor
 */
function Skill(name)
{
	this.components = [];

	// Included to simplify code when adding components
	this.html = document.getElementById('builderContent');
	
	this.dataKey = 'attributes';
	this.componentKey = 'components';
	
	// Skill data
    var iconList = materialList.slice(0);
    iconList.splice(materialList.indexOf('Arrow'), 1);
	this.data = [
		new StringValue('名称', 'name', name).setTooltip('技能名称，请务必不要使用颜色代码'),
		new StringValue('类型', 'type', 'Dynamic').setTooltip('用来显示技能类型，比如说：近战技能/远程技能或其他随便填咯'),
		new IntValue('最大等级', 'max-level', 5).setTooltip('技能最大能点到几级'),
		new ListValue('父技能', 'skill-req', ['None'], 'None').setTooltip('需要先解锁父技能才能学习此技能'),
		new IntValue('父技能等级', 'skill-req-lvl', 1).setTooltip('将父技能提升至所需要的等级才能学习此技能'),
		new ListValue('权限', 'needs-permission', ['True', 'False'], 'False').setTooltip('只有拥有权限的人才能学习此技能，权限格式："skillapi.skill.{技能名称}"'),
		new AttributeValue('等级要求', 'level', 1, 0).setTooltip('只有当职业等级达到指定要求才能学习此技能'),
		new AttributeValue('技能点', 'cost', 1, 0).setTooltip('解锁以及升级此技能所需要的技能点数'),
		new AttributeValue('冷却', 'cooldown', 0, 0).setTooltip('技能冷却时间(技能为主动释放)'),
		new AttributeValue('法力值', 'mana', 0, 0).setTooltip('技能消耗的法力值(技能为主动释放)'),
		new StringValue('释放信息', 'msg', '&6玩家{player} &2释放了&6{skill}').setTooltip('技能释放时显示给玩家的信息，信息半径与 config.yml 文件中设置'),
        new StringValue('组合键', 'combo', '').setTooltip('使用组合键释放技能，L R S分别为 左键 右键 下蹲 如"L L R S"为双击左键 单击右键 点击下蹲释放.'),
        new ListValue('指示器', 'indicator', [ '2D', '3D', 'None' ], '2D').setTooltip('[PREMIUM] 用于预览的显示类型（虽然我完全不知道什么意思）'),
		new ListValue('图标', 'icon', iconList, 'Jack O Lantern').setTooltip('在GUI中技能显示的图标'),
		new IntValue('图标数据', 'icon-data', 0).setTooltip('在GUI中技能显示的图标数据/耐久'),
		new StringListValue('图标Lore', 'icon-lore', [
			'&d{name} &7({level}/{max})',
			'&2类型: &6{type}',
			'',
			'{req:level}等级: {attr:level}',
			'{req:cost}技能点: {attr:cost}',
			'',
			'&2法力值: {attr:mana}',
			'&2冷却: {attr:cooldown}'
		]).setTooltip('在GUI中技能显示的Lore')
	];
}

/**
 * Applies the skill data to the HTML page, overwriting any previous data
 */ 
Skill.prototype.apply = function() 
{
	var builder = document.getElementById('builderContent');
	builder.innerHTML = '';
	
	// Set up the builder content
	for (var i = 0; i < this.components.length; i++)
	{
		this.components[i].createBuilderHTML(builder);
	}
}

/**
 * Creates the form HTML for editing the skill and applies it to
 * the appropriate area on the page
 */
Skill.prototype.createFormHTML = function()
{
	var form = document.createElement('form');
	
	var header = document.createElement('h4');
	header.innerHTML = '技能设置';
	form.appendChild(header);
	
	var h = document.createElement('hr');
	form.appendChild(h);
	
	this.data[3].list.splice(1, this.data[3].list.length - 1);
	for (var i = 0; i < skills.length; i++)
	{
		if (skills[i] != this) 
		{
			this.data[3].list.push(skills[i].data[0].value);
		}
	}
	for (var i = 0; i < this.data.length; i++)
	{
		this.data[i].createHTML(form);
	}
	
	var hr = document.createElement('hr');
	form.appendChild(hr);
	
	var done = document.createElement('h5');
	done.className = 'doneButton';
	done.innerHTML = '编辑效果',
	done.skill = this;
	done.form = form;
	done.addEventListener('click', function(e) {
		this.skill.update();
		var list = document.getElementById('skillList');
		list[list.selectedIndex].text = this.skill.data[0].value;
		this.form.parentNode.removeChild(this.form);
		showSkillPage('builder');
	});
	form.appendChild(done);
	
	var target = document.getElementById('skillForm');
	target.innerHTML = '';
	target.appendChild(form);
}

/**
 * Updates the skill data from the details form if it exists
 */
Skill.prototype.update = function()
{
	var index;
	var list = document.getElementById('skillList');
	for (var i = 0; i < skills.length; i++)
	{
		if (skills[i] == this)
		{
			index = i;
			break;
		}
	}
	var prevName = this.data[0].value;
	for (var j = 0; j < this.data.length; j++)
	{
		this.data[j].update();
	}
	var newName = this.data[0].value;
	this.data[0].value = prevName;
	if (isSkillNameTaken(newName)) return;
	this.data[0].value = newName;
	list[index].text = this.data[0].value;
}

/**
 * Checks whether or not the skill is using a given trigger
 *
 * @param {string} trigger - name of the trigger to check
 *
 * @returns {boolean} true if using it, false otherwise
 */ 
Skill.prototype.usingTrigger = function(trigger)
{
	for (var i = 0; i < this.components.length; i++)
	{
		if (this.components[i].name == trigger) return true;
	}
	return false;
}

/**
 * Creates and returns a save string for the skill
 */ 
Skill.prototype.getSaveString = function()
{
	var saveString = '';
	
	saveString += this.data[0].value + ":\n";
	for (var i = 0; i < this.data.length; i++)
	{
		if (this.data[i] instanceof AttributeValue) continue;
		saveString += this.data[i].getSaveString('  ');
	}
	saveString += '  attributes:\n';
	for (var i = 0; i < this.data.length; i++)
	{
		if (this.data[i] instanceof AttributeValue)
		{
			saveString += this.data[i].getSaveString('    ');
		}
	}
	if (this.components.length > 0)
	{
		saveString += '  components:\n';
		saveIndex = 0;
		for (var i = 0; i < this.components.length; i++)
		{
			saveString += this.components[i].getSaveString('    ');
		}
	}
	return saveString;
}

/**
 * Loads skill data from the config lines stating at the given index
 *
 * @param {YAMLObject} data - the data to load
 *
 * @returns {Number} the index of the last line of data for this skill
 */
Skill.prototype.load = function(data)
{
	if (data.active || data.embed || data.passive)
	{
		// Load old skill config for conversion
	}
	else 
	{
		this.loadBase(data);
	}
}

Skill.prototype.loadBase = loadSection;

/**
 * Creates a new skill and switches the view to it
 *
 * @returns {Skill} the new skill
 */ 
function newSkill()
{
	var id = 1;
	while (isSkillNameTaken('技能 ' + id)) id++;
	
	activeSkill = addSkill('技能 ' + id);
	
	var list = document.getElementById('skillList');
	list.selectedIndex = list.length - 2;
	
	activeSkill.apply();
	activeSkill.createFormHTML();
	showSkillPage('skillForm');
	
	return activeSkill;
}

/**
 * Adds a skill to the editor without switching the view to it
 *
 * @param {string} name - the name of the skill to add
 *
 * @returns {Skill} the added skill
 */ 
function addSkill(name) 
{
	var skill = new Skill(name);
	skills.push(skill);
	
	var option = document.createElement('option');
	option.text = name;
	var list = document.getElementById('skillList');
	list.add(option, list.length - 1);
	
	return skill;
}

/**
 * Checks whether or not a skill name is currently taken
 *
 * @param {string} name - name to check for
 *
 * @returns {boolean} true if the name is taken, false otherwise
 */ 
function isSkillNameTaken(name)
{
	return getSkill(name) != null;
}

/**
 * Retrieves a skill by name
 *
 * @param {string} name - name of the skill to retrieve
 *
 * @returns {Skill} the skill with the given name or null if not found
 */
function getSkill(name)
{
	name = name.toLowerCase();
	for (var i = 0; i < skills.length; i++)
	{
		if (skills[i].data[0].value.toLowerCase() == name) return skills[i];
	}
	return null;
}


var activeSkill = new Skill('技能 1');
var activeComponent = undefined;
var skills = [activeSkill];
activeSkill.createFormHTML();
showSkillPage('skillForm');
