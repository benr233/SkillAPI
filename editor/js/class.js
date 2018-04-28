/**
 * Represents the data for a dynamic class
 *
 * @param {string} name - name of the class
 *
 * @constructor
 */ 
function Class(name) 
{
	this.dataKey = 'attributes';
	this.componentKey = 'classes do not have components';
    this.attribCount = 0;
	
	// Class data
	this.data = [
		new StringValue('名称', 'name', name).setTooltip('职业的名称,这里不能使用颜色代码'),
		new StringValue('前缀', 'prefix', '&6' + name).setTooltip('显示职业前缀,这里可以使用颜色代码'),
		new StringValue('群组', 'group', name).setTooltip('职业的群组,可以用来设置为主/副职业'),
		new StringValue('法力名称', 'mana', '&2Mana').setTooltip('职业的法力名称,如魔力/怒气/灵力等'),
		new IntValue('最大等级', 'max-level', 40).setTooltip('当前职业所能达到的最大等级.'),
		new ListValue('父职业', 'parent', ['None'], 'None').setTooltip('必须先拥有父职业才能选择当前职业'),
		new ListValue('权限', 'needs-permission', ['True', 'False'], 'False').setTooltip('只有拥有权限的人才能选择职业,当前权限为:"skillapi.class.{职业名称}"'),
        new ByteListValue('经验来源', 'exp-source', [ '生物', '破坏方块', '放置方块', '合成', '指令', '特殊(???)', '经验瓶', '熔炼', '任务' ], 273).setTooltip('职业经验的来源，大多数只有"use-exp-orbs"(使用经验瓶)会在config.yml中启用.'),
		new AttributeValue('生命值', 'health', 20, 0).setTooltip('职业初始生命值'),
		new AttributeValue('法力值', 'mana', 20, 0).setTooltip('角色初始法力值'),
		new DoubleValue('法力回复', 'mana-regen', 1, 0).setTooltip('法力回复速度'),
		new ListValue('技能树', 'tree', [ 'BasicHorizontal', 'BasicVertical', 'LevelHorizontal', 'LevelVertical', 'Flood', 'Requirement' ], 'Requirement'),
		new StringListValue('技能(一行填一个名字)', 'skills', []).setTooltip('当前职业的技能(一行填一个)'),
		new ListValue('图标', 'icon', materialList, 'Jack-O-Lantern').setTooltip('在GUI界面中显示的职业图标'),
		new IntValue('图标数据', 'icon-data', 0).setTooltip('在GUI界面中显示的职业图标的 数据/耐久'),
		new StringListValue('图标lore', 'icon-lore', [
			'&a{name}  &7(等级:{level})',
			'&2类型: &6{group}',
			'',
			'&e简介:',
			'&b',
		]).setTooltip('在GUI界面中显示的职业介绍')
	];
    
    this.updateAttribs(10);
}

Class.prototype.updateAttribs = function(i)
{
    var j = 0;
    var back = {};
    while (this.data[i + j] instanceof AttributeValue)
    {
        back[this.data[i + j].key.toLowerCase()] = this.data[i + j];
        j++;
    }
    this.data.splice(i, this.attribCount);
    this.attribCount = 0;
    for (j = 0; j < ATTRIBS.length; j++)
    {
        var attrib = ATTRIBS[j].toLowerCase();
        var format = attrib.charAt(0).toUpperCase() + attrib.substr(1);
        this.data.splice(i + j, 0, new AttributeValue(format, attrib.toLowerCase(), 0, 0)
            .setTooltip('当前职业的' + attrib + '等级')
        );
        if (back[attrib]) 
        {
            var old = back[attrib];
            this.data[i + j].base = old.base;
            this.data[i + j].scale = old.scale;
        }
        this.attribCount++;
    }
};

/**
 * Creates the form HTML for editing the class and applies it to
 * the appropriate area on the page
 */
Class.prototype.createFormHTML = function()
{
	var form = document.createElement('form');
	
	var header = document.createElement('h4');
	header.innerHTML = '职业设置';
	form.appendChild(header);
	
	var h = document.createElement('hr');
	form.appendChild(h);
	
	this.data[5].list.splice(1, this.data[5].list.length - 1);
	for (var i = 0; i < classes.length; i++)
	{
		if (classes[i] != this) 
		{
			this.data[5].list.push(classes[i].data[0].value);
		}
	}
	for (var i = 0; i < this.data.length; i++)
	{
		this.data[i].createHTML(form);
        
        // Append attributes
        if (this.data[i].name == 'Mana')
        {
            this.updateAttribs(i + 1);
        }
	}
	
	var hr = document.createElement('hr');
	form.appendChild(hr);
	
	var save = document.createElement('h5');
	save.innerHTML = 'Save',
	save.classData = this;
	save.addEventListener('click', function(e) {
		this.classData.update();
		saveToFile(this.classData.data[0].value + '.yml', this.classData.getSaveString());
	});
	form.appendChild(save);
	
	var del = document.createElement('h5');
	del.innerHTML = 'Delete',
	del.className = 'cancelButton';
	del.addEventListener('click', function(e) {
		var list = document.getElementById('classList');
		var index = list.selectedIndex;
		
		classes.splice(index, 1);
		if (classes.length == 0)
		{
			newClass();
		}
		list.remove(index);
		index = Math.min(index, classes.length - 1);
		activeClass = classes[index];
		list.selectedIndex = index;
	});
	form.appendChild(del);
	
	var target = document.getElementById('classForm');
	target.innerHTML = '';
	target.appendChild(form);
};

/**
 * Updates the class data from the details form if it exists
 */
Class.prototype.update = function()
{
	var index;
	var list = document.getElementById('classList');
	for (var i = 0; i < classes.length; i++)
	{
		if (classes[i] == this)
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
	if (isClassNameTaken(newName)) return;
	this.data[0].value = newName;
	list[index].text = this.data[0].value;
};

/**
 * Creates and returns a save string for the class
 */ 
Class.prototype.getSaveString = function()
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
	return saveString;
};

/**
 * Loads class data from the config lines stating at the given index
 *
 * @param {YAMLObject} data - the data to load
 *
 * @returns {Number} the index of the last line of data for this class
 */
Class.prototype.load = loadSection;

/**
 * Creates a new class and switches the view to it
 *
 * @returns {Class} the new class
 */ 
function newClass()
{
	var id = 1;
	while (isClassNameTaken('职业 ' + id)) id++;
	
	activeClass = addClass('职业 ' + id);
	
	var list = document.getElementById('classList');
	list.selectedIndex = list.length - 2;
	
	activeClass.createFormHTML();
	
	return activeClass;
}

/**
 * Adds a skill to the editor without switching the view to it
 *
 * @param {string} name - the name of the skill to add
 *
 * @returns {Skill} the added skill
 */ 
function addClass(name) 
{
	var c = new Class(name);
	classes.push(c);
	
	var option = document.createElement('option');
	option.text = name;
	var list = document.getElementById('classList');
	list.add(option, list.length - 1);
	
	return c;
}

/**
 * Checks whether or not a class name is currently taken
 *
 * @param {string} name - name to check for
 *
 * @returns {boolean} true if the name is taken, false otherwise
 */ 
function isClassNameTaken(name)
{
	return getClass(name) != null;
}

/**
 * Retrieves a class by name
 *
 * @param {string} name - name of the class to retrieve
 *
 * @returns {Class} the class with the given name or null if not found
 */
function getClass(name)
{
	name = name.toLowerCase();
	for (var i = 0; i < classes.length; i++)
	{
		if (classes[i].data[0].value.toLowerCase() == name) return classes[i];
	}
	return null;
}

var activeClass = new Class('职业 1');
var classes = [activeClass];
activeClass.createFormHTML();
