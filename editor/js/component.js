var hoverSpace;

var DAMAGE_TYPES = [ 'Block Explosion', 'Contact', 'Cramming', 'Dragon Breath', 'Drowning', 'Entity Attack', 'Entity Explosion', 'Fall', 'Falling Block', 'Fire', 'Fire Tick', 'Fly Into Wall', 'Hot Floor', 'Lava', 'Lightning', 'Magic', 'Melting', 'Poison', 'Projectile', 'Starvation', 'Suffocation', 'Suicide', 'Thorns', 'Void', 'Wither' ];

function canDrop(thing, target) {
    if (thing == target) return false;
    
    var temp = target;
    while (temp.parentNode) {
        temp = temp.parentNode;
        if (temp == thing) return false;
    }
    return true;
}

/**
 * Types of components
 */
var Type = {
    TRIGGER   : 'trigger',
    TARGET    : 'target',
    CONDITION : 'condition',
    MECHANIC  : 'mechanic'
};

/**
 * Available triggers for activating skill effects
 */
var Trigger = {
    CAST                 : { name: '主动触发',                 container: true, construct: TriggerCast               },
    CLEANUP              : { name: '清除触发',              container: true, construct: TriggerCleanup            },
    CROUCH               : { name: '下蹲触发',               container: true, construct: TriggerCrouch             },
    DEATH                : { name: '死亡触发',                container: true, construct: TriggerDeath              },
    ENVIRONMENT_DAMAGE   : { name: '环境触发',   container: true, construct: TriggerEnvironmentDamage, premium: true },
    INITIALIZE           : { name: '复活触发',           container: true, construct: TriggerInitialize         },
    KILL                 : { name: '击杀触发',                 container: true, construct: TriggerKill               },
    LAND                 : { name: '落地触发',                 container: true, construct: TriggerLand               },
    LAUNCH               : { name: '射击触发',               container: true, construct: TriggerLaunch             },
    PHYSICAL_DAMAGE      : { name: '物理攻击触发',      container: true, construct: TriggerPhysicalDamage     },
    SKILL_DAMAGE         : { name: '技能攻击触发',         container: true, construct: TriggerSkillDamage        },
    TOOK_PHYSICAL_DAMAGE : { name: '受到物理伤害触发', container: true, construct: TriggerTookPhysicalDamage },
    TOOK_SKILL_DAMAGE    : { name: '受到技能伤害触发',    container: false, construct: TriggerTookSkillDamage    }
};

/**
 * Available target component data
 */ 
var Target = {
    AREA     : { name: '半径',     container: true, construct: TargetArea     },
    CONE     : { name: '圆锥',     container: true, construct: TargetCone     },
    LINEAR   : { name: '直线',   container: true, construct: TargetLinear   },
    LOCATION : { name: '坐标', container: true, construct: TargetLocation },
    NEAREST  : { name: '附近',  container: true, construct: TargetNearest  },
    OFFSET   : { name: '不规则',   container: true, construct: TargetOffset   },
    REMEMBER : { name: '记忆', container: true, construct: TargetRemember },
    SELF     : { name: '自身',     container: true, construct: TargetSelf     },
    SINGLE   : { name: '单独',   container: true, construct: TargetSingle   }
};

/**
 * Available condition component data
 */ 
var Condition = {
    ARMOR:       { name: '护甲',       container: true, construct: ConditionArmor      },
    ATTRIBUTE:   { name: '属性',   container: true, construct: ConditionAttribute  },
    BIOME:       { name: '生物群系',       container: true, construct: ConditionBiome      },
    BLOCK:       { name: '方块',       container: true, construct: ConditionBlock      },
    CHANCE:      { name: '几率',      container: true, construct: ConditionChance     },
    CLASS:       { name: '职业',       container: true, construct: ConditionClass      },
    CLASS_LEVEL: { name: '职业等级', container: true, construct: ConditionClassLevel },
    COMBAT:      { name: '战斗',      container: true, construct: ConditionCombat     },
    CROUCH:      { name: '下蹲',      container: true, construct: ConditionCrouch     },
    DIRECTION:   { name: '方向',   container: true, construct: ConditionDirection  },
    ELEVATION:   { name: '高度',   container: true, construct: ConditionElevation  },
    ELSE:        { name: '其他',        container: true, construct: ConditionElse,      premium: true },
    ENTITY_TYPE: { name: '实体类型', container: true, construct: ConditionEntityType,premium: true },
    FIRE:        { name: '燃烧',        container: true, construct: ConditionFire       },
    FLAG:        { name: '标记',        container: true, construct: ConditionFlag       },
    HEALTH:      { name: '生命值',      container: true, construct: ConditionHealth     },
    INVENTORY:   { name: '背包物品',   container: true, construct: ConditionInventory  },
    ITEM:        { name: '手持物品',        container: true, construct: ConditionItem       },
    LIGHT:       { name: '亮度',       container: true, construct: ConditionLight      },
    MANA:        { name: '法术',        container: true, construct: ConditionMana       },
    NAME:        { name: '名称',        container: true, construct: ConditionName       },
    OFFHAND:     { name: '副手',     container: true, construct: ConditionOffhand    },
    PERMISSION:  { name: '权限',  container: true, construct: ConditionPermission,premium: true },
    POTION:      { name: '药水',      container: true, construct: ConditionPotion     },
    SKILL_LEVEL: { name: '技能等级', container: true, construct: ConditionSkillLevel },
    SLOT:        { name: '槽位',        container: true, construct: ConditionSlot,      premium: true },
    STATUS:      { name: '状态',      container: true, construct: ConditionStatus     },
    TIME:        { name: '时间',        container: true, construct: ConditionTime       },
    TOOL:        { name: '工具',        container: true, construct: ConditionTool       },
    VALUE:       { name: '属性范围',       container: true, construct: ConditionValue      },
    WATER:       { name: '水',       container: true, construct: ConditionWater      }
};

/**
 * Available mechanic component data
 */
var Mechanic = {
    ATTRIBUTE:           { name: '属性加成',           container: false, construct: MechanicAttribute          },
    BLOCK:               { name: '生成方块',               container: false, construct: MechanicBlock              },
    CANCEL:              { name: '取消',              container: false, construct: MechanicCancel             },
    CHANNEL:             { name: '吟唱',             container: true,  construct: MechanicChannel            },
    CLEANSE:             { name: '净化',             container: false, construct: MechanicCleanse            },
    COMMAND:             { name: '指令',             container: false, construct: MechanicCommand            },
    COOLDOWN:            { name: '冷却缩减',            container: false, construct: MechanicCooldown           },
    DAMAGE:              { name: '造成伤害',              container: false, construct: MechanicDamage             },
    DAMAGE_BUFF:         { name: '攻击加成',         container: false, construct: MechanicDamageBuff         },
    DAMAGE_LORE:         { name: '攻击标签',         container: false, construct: MechanicDamageLore         },
    DEFENSE_BUFF:        { name: '防御加成',        container: false, construct: MechanicDefenseBuff        },
    DELAY:               { name: '延迟',               container: true,  construct: MechanicDelay              },
    DISGUISE:            { name: '伪装',            container: false, construct: MechanicDisguise           },
    EXPLOSION:           { name: '爆炸',           container: false, construct: MechanicExplosion          },
    FIRE:                { name: '燃烧',                container: false, construct: MechanicFire               },
    FLAG:                { name: '标记',                container: false, construct: MechanicFlag               },
    FLAG_CLEAR:          { name: '清除标记',          container: false, construct: MechanicFlagClear          },
    FLAG_TOGGLE:         { name: '切换标记',         container: false, construct: MechanicFlagToggle         },
    FORGET_TARGETS:      { name: '遗忘目标',      container: false, construct: MechanicForgetTargets,     premium: true },
    HEAL:                { name: '生命恢复',                container: false, construct: MechanicHeal               },
    HELD_ITEM:           { name: '手持物品',           container: false, construct: MechanicHeldItem,          premium: true },
    IMMUNITY:            { name: '免疫伤害',            container: false, construct: MechanicImmunity           },
    INTERRUPT:           { name: '中断',           container: false, construct: MechanicInterrupt          },
    ITEM:                { name: '给予物品',                container: false, construct: MechanicItem               },
    ITEM_PROJECTILE:     { name: '抛射物',     container: true,  construct: MechanicItemProjectile     },
    ITEM_REMOVE:         { name: '删除物品',         container: false, construct: MechanicItemRemove         },
    LAUNCH:              { name: '冲刺',              container: false, construct: MechanicLaunch             },
    LIGHTNING:           { name: '闪电',           container: false, construct: MechanicLightning          },
    MANA:                { name: '法力回复',                container: false, construct: MechanicMana               },
    MESSAGE:             { name: '聊天信息',             container: false, construct: MechanicMessage            },
    PARTICLE:            { name: '粒子',            container: false, construct: MechanicParticle           },
    PARTICLE_ANIMATION:  { name: '粒子动画',  container: false, construct: MechanicParticleAnimation  },
    PARTICLE_EFFECT:     { name: '粒子效果',     container: false, construct: MechanicParticleEffect,    premium: true },
    CANCEL_EFFECT:       { name: '取消效果',       container: false, construct: MechanicCancelEffect,      premium: true },
    PARTICLE_PROJECTILE: { name: '粒子抛射', container: true,  construct: MechanicParticleProjectile },
    PASSIVE:             { name: '被动',             container: true,  construct: MechanicPassive            },
    PERMISSION:          { name: '权限',          container: false, construct: MechanicPermission         },
    POTION:              { name: '药水',              container: false, construct: MechanicPotion             },
    POTION_PROJECTILE:   { name: '药水抛射',   container: true,  construct: MechanicPotionProjectile   },
    PROJECTILE:          { name: '抛射物',          container: true,  construct: MechanicProjectile         },
    PURGE:               { name: '净化',               container: false, construct: MechanicPurge              },
    PUSH:                { name: '推',                container: false, construct: MechanicPush               },
    REMEMBER_TARGETS:    { name: '记住目标',    container: false, construct: MechanicRememberTargets    },
    REPEAT:              { name: '重复',              container: true,  construct: MechanicRepeat             },
    SOUND:               { name: '声音',               container: false, construct: MechanicSound              },
    SPEED:               { name: '速度',               container: false, construct: MechanicSpeed              },
    STATUS:              { name: '状态',              container: false, construct: MechanicStatus             },
    TAUNT:               { name: '嘲讽',               container: false, construct: MechanicTaunt              },
    VALUE_ADD:           { name: '添加储存值',           container: false, construct: MechanicValueAdd           },
    VALUE_ATTRIBUTE:     { name: '属性储存值',     container: false, construct: MechanicValueAttribute     },
    VALUE_HEALTH:        { name: '生命储存值',        container: false, construct: MechanicValueHealth,       premium: true },
    VALUE_LOCATION:      { name: '坐标储存值',      container: false, construct: MechanicValueLocation      },
    VALUE_LORE:          { name: '标签储存值',          container: false, construct: MechanicValueLore          },
    VALUE_LORE_SLOT:     { name: '标签槽储存值',     container: false, construct: MechanicValueLoreSlot,     premium: true},
    VALUE_MANA:          { name: '法力储存值',          container: false, construct: MechanicValueMana,         premium: true },
    VALUE_MULTIPLY:      { name: '倍数储存值',      container: false, construct: MechanicValueMultiply      },
    VALUE_RANDOM:        { name: '随机储存值',        container: false, construct: MechanicValueRandom        },
    VALUE_SET:           { name: '普通储存值',           container: false, construct: MechanicValueSet           },
    WARP:                { name: '传送',                container: false, construct: MechanicWarp               },
    WARP_LOC:            { name: '坐标传送',       container: false, construct: MechanicWarpLoc            },
    WARP_RANDOM:         { name: '随机传送',         container: false, construct: MechanicWarpRandom         },
    WARP_SWAP:           { name: '相互传送',           container: false, construct: MechanicWarpSwap           },
    WARP_TARGET:         { name: '目标传送',         container: false, construct: MechanicWarpTarget         },
    WARP_VALUE:          { name: '数值传送',          container: false, construct: MechanicWarpValue          },
    WOLF:                { name: '狼',                container: true,  construct: MechanicWolf               }
};

var saveIndex;

/**
 * Represents a component of a dynamic skill
 * 
 * @param {string}    name      - name of the component
 * @param {string}    type      - type of the component
 * @param {boolean}   container - whether or not the component can contain others
 * @param {Component} [parent]  - parent of the component if any
 *
 * @constructor
 */
function Component(name, type, container, parent)
{
    this.name = name;
    this.type = type;
    this.container = container;
    this.parent = parent;
    this.html = undefined;
    this.components = [];
    this.data = [new StringValue('钥匙图标', 'icon-key', '').setTooltip('图标Lore使用的选项. 示例:如果填为"area(上面的绿色文字)"那么如果在技能图标Lore中添加上"{attr:area.Radius}"那么就会显示这个技能的半径.')];
    if (this.type == Type.MECHANIC) {
        this.data.push(new ListValue('主动释放', 'counts', [ 'True', 'False' ], 'True')
            .setTooltip('被动技能设置为Flase即可')
        );
    }
    else if (this.type == Type.TRIGGER && name != 'Cast' && name != 'Initialize' && name != 'Cleanup')
    {
        this.data.push(new ListValue('法力值', 'mana', [ 'True', 'False' ], 'False')
            .setTooltip('这个触发条件是否需要使用法力')
        );
        this.data.push(new ListValue('冷却时间', 'cooldown', [ 'True', 'False' ], 'False')
            .setTooltip('这个触发条件是否需要冷却时间归零来激活')
        );
    }
    
    this.dataKey = 'data';
    this.componentKey = 'children';
}

Component.prototype.dupe = function(parent)
{
    var i;
    var ele = new Component(this.name, this.type, this.container, parent);
    for (i = 0; i < this.components.length; i++)
    {
        ele.components.push(this.components[i].dupe());
    }
    for (i = ele.data.length; i < this.data.length; i++)
    {
        ele.data.push(this.data[i].dupe());
    }
    return ele;
}

/**
 * Creates the builder HTML element for the component and
 * appends it onto the target HTML element.
 *
 * @param {Element} target - the HTML element to append the result to
 */
Component.prototype.createBuilderHTML = function(target)
{
    // Create the wrapping divs with the appropriate classes
    var container = document.createElement('div');
    container.comp = this;
    if (this.type == Type.TRIGGER) {
        container.className = 'componentWrapper';
    }
    
    var div = document.createElement('div');
    div.className = 'component ' + this.type;
    if (this.type != Type.TRIGGER) {
        div.draggable = true;
        div.ondragstart = this.drag;
    }
    div.ondrop = this.drop;
    if (this.container) {
        div.ondragover = this.allowDrop;
    }
    
    // Component label
    var label = document.createElement('h3');
    label.title = '编辑 ' + this.name + ' 信息';
    label.className = this.type + 'Label';
    label.innerHTML = this.name;
    label.component = this;
    label.addEventListener('click', function(e) {
        this.component.createFormHTML();
        showSkillPage('skillForm');
    });
    div.appendChild(label);
    
    // Container components can add children so they get a button
    if (this.container) 
    {
        var add = document.createElement('div');
        add.className = 'builderButton';
        add.innerHTML = '+ Add Child';
        add.component = this;
        add.addEventListener('click', function(e) {
            activeComponent = this.component; 
            showSkillPage('componentChooser');
        });
        div.appendChild(add);
        
        var vision = document.createElement('div');
        vision.title = 'Hide Children';
        vision.className = 'builderButton smallButton';
        vision.style.background = 'url("editor/img/eye.png") no-repeat center #222';
        vision.component = this;
        vision.addEventListener('click', function(e) {
            var comp = this.component;
            if (comp.childrenHidden)
            {
                comp.childDiv.style.display = 'block';
                this.style.backgroundImage = 'url("editor/img/eye.png")';
            }
            else 
            {
                comp.childDiv.style.display = 'none';
                this.style.backgroundImage = 'url("editor/img/eyeShaded.png")';
            }
            comp.childrenHidden = !comp.childrenHidden;
        });
        div.appendChild(vision);
        this.childrenHidden = false;
    }
    
    // Add the duplicate button
    if (this.type != Type.TRIGGER)
    {
        var duplicate = document.createElement('div');
        duplicate.className = 'builderButton smallButton';
        duplicate.title = 'Duplicate';
        duplicate.style.background = 'url("editor/img/duplicate.png") no-repeat center #222';
        duplicate.component = this;
        duplicate.addEventListener('click', function(e) {
            var comp = this.component;
            var copy = comp.dupe(comp.parent);
            comp.parent.components.push(copy);
            copy.createBuilderHTML(comp.parent.html);
        });
        div.appendChild(duplicate);
    }
    
    // Add the remove button
    var remove = document.createElement('div');
    remove.title = 'Remove';
    remove.className = 'builderButton smallButton cancelButton';
    remove.style.background = 'url("editor/img/delete.png") no-repeat center #f00';
    remove.component = this;
    remove.addEventListener('click', function(e) {
        var list = this.component.parent.components;
        for (var i = 0; i < list.length; i++) 
        {
            if (list[i] == this.component)
            {
                list.splice(i, 1);
                break;
            }
        }
        this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
    });
    div.appendChild(remove);
    
    container.appendChild(div);
    
    // Apply child components
    var childContainer = document.createElement('div');
    childContainer.className = 'componentChildren';
    if (this.components.length > 0) {
        for (var i = 0; i < this.components.length; i++) 
        {
            this.components[i].createBuilderHTML(childContainer);
        }
    }
    container.appendChild(childContainer);
    this.childDiv = childContainer;
    
    // Append the content
    target.appendChild(container);
       
    this.html = childContainer;
}

Component.prototype.allowDrop = function(e) {
    e.preventDefault();
    if (hoverSpace) {
        hoverSpace.style.marginBottom = '0px';
        hoverSpace.onmouseout = undefined;
    }
    hoverSpace = e.target;
    while (hoverSpace.className.indexOf('component') < 0) {
        hoverSpace = hoverSpace.parentNode;
    }
    var thing = document.getElementById('dragComponent');
    if (hoverSpace.id != 'dragComponent' && hoverSpace.parentNode.comp.container && canDrop(thing, hoverSpace)) {
        hoverSpace.style.marginBottom = '30px';
        hoverSpace.onmouseout = function() {
            if (!hoverSpace) {
                this.onmouseout = undefined;
                return;
            }
            hoverSpace.style.marginBottom = '0px';
            hoverSpace.onmouseout = undefined;
            hoverSpace = undefined;
        }
    }
    else hoverSpace = undefined;
};

Component.prototype.drag = function(e) {
    e.dataTransfer.setData('text', 'anything');
    var dragged = document.getElementById('dragComponent');
    if (dragged) {
        dragged.id = '';
    }
    e.target.id = 'dragComponent';
};

Component.prototype.drop = function(e) {
    if (hoverSpace) {
        hoverSpace.style.marginBottom = '0px';
        hoverSpace = undefined;
    }
    
    e.preventDefault();
    var thing = document.getElementById('dragComponent').parentNode;
    var target = e.target;
    while (target.className.indexOf('component') < 0) {
        target = target.parentNode;
    }
    if (target.id == 'dragComponent' || !target.parentNode.comp.container || !canDrop(thing, target)) {
        return;
    }
    var targetComp = target.parentNode.comp;
    var thingComp = thing.comp;
    target = target.parentNode.childNodes[1];
    thing.parentNode.removeChild(thing);
    target.appendChild(thing);
    
    thingComp.parent.components.splice(thingComp.parent.components.indexOf(thingComp), 1);
    thingComp.parent = targetComp;
    thingComp.parent.components.push(thingComp);
};

/**
 * Creates the form HTML for editing the component data and
 * applies it to the appropriate part of the page.
 */
Component.prototype.createFormHTML = function()
{
    var target = document.getElementById('skillForm');
    
    var form = document.createElement('form');
    
    var header = document.createElement('h4');
    header.innerHTML = this.name;
    form.appendChild(header);
    
    if (this.description)
    {
        var desc = document.createElement('p');
        desc.innerHTML = this.description;
        form.appendChild(desc);
    }
    
    if (this.data.length > 1) 
    {
        var h = document.createElement('hr');
        form.appendChild(h);
        
        var i = 1;
        for (var j = 1; j < this.data.length; j++) {
            if (this.data[j] instanceof AttributeValue) {
                i = 0;
                break;
            }
        }
        for (; i < this.data.length; i++)
        {
            this.data[i].hidden = false;
            this.data[i].createHTML(form);
        }
    }
    
    var hr = document.createElement('hr');
    form.appendChild(hr);
    
    var done = document.createElement('h5');
    done.className = 'doneButton';
    done.innerHTML = 'Done';
    done.component = this;
    done.addEventListener('click', function(e) {
        this.component.update();
        document.getElementById('skillForm').removeChild(this.component.form);
        showSkillPage('builder');
    });
    form.appendChild(done);
    
    this.form = form;
    
    target.innerHTML = '';
    target.appendChild(form);
    activeComponent = this;
    
    for (var i = 0; i < this.data.length; i++)
    {
        this.data[i].applyRequireValues();
    }
}

/**
 * Updates the component using the form data if it exists
 */
Component.prototype.update = function()
{
    for (var j = 0; j < this.data.length; j++)
    {
        this.data[j].update();
    }
}

/**
 * Gets the save string for the component
 *
 * @param {string} spacing - spacing to put before the data
 */
Component.prototype.getSaveString = function(spacing)
{
    this.createFormHTML();
    
    var id = '';
    var index = saveIndex;
    while (index > 0 || id.length == 0)
    {
        id += String.fromCharCode((index % 26) + 97);
        index = Math.floor(index / 26);
    }
    var result = spacing + this.name + '-' + id + ":\n";
    saveIndex++;
    
    result += spacing + "  type: '" + this.type + "'\n";
    if (this.data.length > 0)
    {
        result += spacing + '  data:\n';
        for (var i = 0; i < this.data.length; i++)
        {
            if (!this.data[i].hidden)
                result += this.data[i].getSaveString(spacing + '    ');
        }
    }
    if (this.components.length > 0)
    {
        result += spacing + '  children:\n';
        for (var j = 0; j < this.components.length; j++)
        {
            result += this.components[j].getSaveString(spacing + '    ');
        }
    }
    return result;
}

/**
 * Loads component data from the config lines stating at the given index
 *
 * @param {YAMLObject} data - the data to load
 *
 * @returns {Number} the index of the last line of data for this component
 */
Component.prototype.load = loadSection;

// -- Trigger constructors ----------------------------------------------------- //

extend('TriggerCast', 'Component');
function TriggerCast()
{
    this.super('Cast', Type.TRIGGER, true);
    
    this.description = '使用技能栏/组合键/指令来释放技能 仅限3.0以下版本';
}

extend('TriggerCleanup', 'Component');
function TriggerCleanup()
{
    this.super('Cleanup', Type.TRIGGER, true);
    
    this.description = '当玩家遗忘或删除技能时触发';
}

extend('TriggerCrouch', 'Component');
function TriggerCrouch()
{
    this.super('Crouch', Type.TRIGGER, true);
    
    this.description = '当玩家按下Shift键时触发.';
    
    this.data.push(new ListValue('类型', 'type', [ 'Start Crouching', 'Stop Crouching', 'Both' ], 'Start Crouching')
        .setTooltip('分别为 按下Shift 松开Shift 单击Shift')
    );
}

extend('TriggerDeath', 'Component');
function TriggerDeath()
{
    this.super('Death', Type.TRIGGER, true);
    
    this.description = '当玩家死亡时释放技能';
}

extend('TriggerEnvironmentDamage', 'Component');
function TriggerEnvironmentDamage()
{
    this.super('Environment Damage', Type.TRIGGER, true);
    
    this.description = '当玩家被周围环境造成伤害时释放技能';
    
    this.data.push(new ListValue('种类', 'type', DAMAGE_TYPES, 'FALL'));
}


extend('TriggerInitialize', 'Component');
function TriggerInitialize()
{
    this.super('Initialize', Type.TRIGGER, true);
    
    this.description = '玩家复活时触发技能，可以用来作为被动技能';
}

extend('TriggerKill', 'Component');
function TriggerKill()
{
    this.super('Kill', Type.TRIGGER, true);
    
    this.description = '当玩家击杀实体时释放技能';
}

extend('TriggerLand', 'Component');
function TriggerLand()
{
    this.super('Land', Type.TRIGGER, true);
    
    this.description = '当玩家降落至地面时释放技能';
    
    this.data.push(new DoubleValue('最小距离', 'min-distance', 0)
        .setTooltip('只有在最小距离之上掉落才会触发技能')
    );
}

extend('TriggerLaunch', 'Component');
function TriggerLaunch()
{
    this.super('Launch', Type.TRIGGER, true);
    
    this.description = '当玩家投掷某物时释放技能';
    
    this.data.push(new ListValue('类型', 'type', [ 'Any', 'Arrow', 'Egg', 'Ender Pearl', 'Fireball', 'Fishing Hook', 'Snowball' ], 'Any')
        .setTooltip('分别为 所有 箭矢 鸡蛋 末影珍珠 火球 鱼钩 雪球')
    );
}

extend('TriggerPhysicalDamage', 'Component');
function TriggerPhysicalDamage()
{
    this.super('Physical Damage', Type.TRIGGER, true);
    
    this.description = '当玩家造成物理攻击时释放技能';
    
    this.data.push(new ListValue('释放目标', 'target', [ 'True', 'False' ], 'True')
        .setTooltip('设置为True代表对你攻击的目标释放技能，设置为Flase代表对你瞄准的目标释放技能')
    ); 
    this.data.push(new ListValue('种类', 'type', [ 'Both', 'Melee', 'Projectile' ], 'Both')
        .setTooltip('造成物理攻击的类型 分别为： 两者 近程 远程')
    );
    this.data.push(new DoubleValue("最小伤害", "dmg-min", 0)
        .setTooltip('当造成的物理攻击大于最小伤害就释放技能')
    );
    this.data.push(new DoubleValue("最大伤害", "dmg-max", 999)
        .setTooltip('当造成的物理攻击大于最大伤害就取消技能')
    );
}

extend('TriggerSkillDamage', 'Component');
function TriggerSkillDamage()
{
    this.super('Skill Damage', Type.TRIGGER, true);
    
    this.description = '当玩家造成技能攻击时施放技能';
    
    this.data.push(new ListValue('释放目标', 'target', [ 'True', 'False' ], 'True')
        .setTooltip('设置为True代表对你攻击的目标释放技能，设置为Flase代表对你瞄准的目标释放技能')
    ); 
    this.data.push(new DoubleValue("最小伤害", "dmg-min", 0)
        .setTooltip('当造成的技能攻击大于最小伤害就释放技能')
    );
    this.data.push(new DoubleValue("最大伤害", "dmg-max", 999)
        .setTooltip('当造成的技能攻击大于最大伤害就取消技能')
    );
}

extend('TriggerTookPhysicalDamage', 'Component');
function TriggerTookPhysicalDamage()
{
    this.super('Took Physical Damage', Type.TRIGGER, true);
    
    this.description = '当玩家受到物理攻击时释放技能.';
    
    this.data.push(new ListValue('释放目标', 'target', [ 'True', 'False' ], 'True')
        .setTooltip('设置为True代表对攻击你的目标释放技能，设置为Flase代表对你瞄准的目标释放技能')
    ); 
    this.data.push(new ListValue('种类', 'type', [ 'Both', 'Melee', 'Projectile' ], 'Both')
        .setTooltip('收到物理攻击的类型 分别为： 两者 近程 远程')
    );
    this.data.push(new DoubleValue("最小伤害", "dmg-min", 0)
        .setTooltip('当受到的物理攻击大于最小伤害就释放技能')
    );
    this.data.push(new DoubleValue("最大伤害", "dmg-max", 999)
        .setTooltip('当受到的物理攻击大于最大伤害就取消技能')
    );
}

extend('TriggerTookSkillDamage', 'Component');
function TriggerTookSkillDamage()
{
    this.super('Took Skill Damage', Type.TRIGGER, true);
    
    this.description = '当玩家受到技能攻击时施放技能';
    
    this.data.push(new ListValue('释放目标', 'target', [ 'True', 'False' ], 'True')
        .setTooltip('设置为True代表对攻击你的目标释放技能，设置为Flase代表对你瞄准的目标释放技能')
    ); 
    this.data.push(new DoubleValue("最小伤害", "dmg-min", 0)
        .setTooltip('当受到的技能攻击大于最小伤害就释放技能')
    );
    this.data.push(new DoubleValue("最大伤害", "dmg-max", 999)
        .setTooltip('当受到的技能攻击大于最大伤害就取消技能')
    );
}

// -- Target constructors ------------------------------------------------------ //

extend('TargetArea', 'Component');
function TargetArea()
{
    this.super('Area', Type.TARGET, true);
    
    this.description = '以施法者为半径范围内的所有实体.';
    
    this.data.push(new AttributeValue("半径", "radius", 3, 0)
        .setTooltip('半径范围')
    );
    this.data.push(new ListValue("群组", "group", ["Ally", "Enemy", "Both"], "Enemy")
        .setTooltip('攻击范围内的实体群组 分别为：盟友 敌人 两者')
    );
    this.data.push(new ListValue("穿墙", "wall", ['True', 'False'], 'False')
        .setTooltip('是否允许技能穿过墙壁')
    );
    this.data.push(new ListValue("包括施法者", "caster", [ 'True', 'False' ], 'False')
        .setTooltip('施法者是否受到技能效果')
    );
    this.data.push(new AttributeValue("最大目标", "max", 99, 0)
        .setTooltip('半径范围内最大攻击多少敌人(超过的不攻击)')
    );
}

extend('TargetCone', 'Component');
function TargetCone()
{
    this.super('Cone', Type.TARGET, true);
    
    this.description = '瞄准施法者前面的一行中的所有生物(圆锥形).';
    
    this.data.push(new AttributeValue("距离", "range", 5, 0)
        .setTooltip('最长距离')
    );
    this.data.push(new AttributeValue("角度", "angle", 90, 0)
        .setTooltip('圆锥弧线角度')
    );
    this.data.push(new ListValue("群组", "group", ["Ally", "Enemy", "Both"], "Enemy")
        .setTooltip('攻击范围内的实体群组 分别为：盟友 敌人 两者')
    );
    this.data.push(new ListValue("穿墙", "wall", ['True', 'False'], 'False')
        .setTooltip('是否允许技能穿墙')
    );
    this.data.push(new ListValue("包括施法者", "caster", [ 'True', 'False' ], 'False')
        .setTooltip('施法者是否受到技能效果')
    );
    this.data.push(new AttributeValue("最大目标", "max", 99, 0)
        .setTooltip('攻击范围内最大攻击多少敌人(超过的不攻击)')
    );
}

extend('TargetLinear', 'Component');
function TargetLinear()
{
    this.super('Linear', Type.TARGET, true);
    
    this.description = '瞄准施法者面前的一行中的所有生物.(直线型)';
    
    this.data.push(new AttributeValue("距离", "range", 5, 0)
        .setTooltip('最长距离')
    );
    this.data.push(new AttributeValue("宽度", "tolerance", 4, 0)
        .setTooltip('最长宽度，越宽越容易攻击.')
    );
    this.data.push(new ListValue("群组", "group", ["Ally", "Enemy", "Both"], "Enemy")
        .setTooltip('攻击范围内的实体群组 分别为：盟友 敌人 两者')
    );
    this.data.push(new ListValue("穿墙", "wall", ['True', 'False'], 'False')
        .setTooltip('是否允许技能穿墙')
    );
    this.data.push(new ListValue("包括施法者", "caster", [ 'True', 'False' ], 'False')
        .setTooltip('施法者是否受到技能效果')
    );
    this.data.push(new AttributeValue("最多目标", "max", 99, 0)
        .setTooltip('攻击范围内最多攻击多少敌人(超过的不攻击)')
    );
}

extend('TargetLocation', 'Component');
function TargetLocation()
{
    this.super('Location', Type.TARGET, true);
    
    this.description = '以坐标为单位,进行十字攻击(好像是)';
    
    this.data.push(new AttributeValue('距离', 'range', 5, 0)
        .setTooltip('坐标最大距离')
    );
}

extend('TargetNearest', 'Component');
function TargetNearest()
{
    this.super('Nearest', Type.TARGET, true);
    
    this.description = '以施法者为中心，攻击距离最近的单位';
    
    this.data.push(new AttributeValue("半径", "radius", 3, 0)
        .setTooltip('攻击半径')
    );
    this.data.push(new ListValue("群组", "group", ["Ally", "Enemy", "Both"], "Enemy")
        .setTooltip('攻击范围内的实体群组 分别为：盟友 敌人 两者')
    );
    this.data.push(new ListValue("穿墙", "wall", ['True', 'False'], 'False')
        .setTooltip('是否允许技能穿墙')
    );
    this.data.push(new ListValue("包括施法者", "caster", [ 'True', 'False' ], 'False')
        .setTooltip('施法者是否受到技能效果')
    );
    this.data.push(new AttributeValue("最多目标", "max", 1, 0)
        .setTooltip('最多攻击多少单位')
    );
}

extend('TargetOffset', 'Component');
function TargetOffset()
{
    this.super('Offset', Type.TARGET, true);
    
    this.description = '针对每个目标的偏移量定位一个位置。';
    
    this.data.push(new AttributeValue('向前偏移', 'forward', 0, 0)
        .setTooltip('目标在所面对的方向上的偏移量，可为负数.')
    );
    this.data.push(new AttributeValue('向上偏移', 'upward', 2, 0.5)
        .setTooltip('目标向上偏移，可为负数.')
    );
    this.data.push(new AttributeValue('向右偏移', 'right', 0, 0)
        .setTooltip('目标向右偏移，可为负数.')
    );
}

extend('TargetRemember', 'Component');
function TargetRemember()
{
    this.super('Remember', Type.TARGET, true);
    
    this.description = '目标使用"Remember Targets"(记住目标)效果来记住目标Key';
    
    this.data.push(new StringValue('Key', 'key', 'target')
        .setTooltip('填拥有"Remember Targets"项的Key')
    );
}

extend('TargetSelf', 'Component');
function TargetSelf()
{
    this.super('Self', Type.TARGET, true);
    
    this.description = '将自身目标发给施法者.';
}

extend('TargetSingle', 'Component');
function TargetSingle()
{
    this.super('Single', Type.TARGET, true);
    
    this.description = '在施法者前面的一个单位.';
    
    this.data.push(new AttributeValue("距离", "range", 5, 0)
        .setTooltip('最大距离')
    );
    this.data.push(new AttributeValue("宽度", "tolerance", 4, 0)
        .setTooltip('最大宽度')
    );
    this.data.push(new ListValue("群组", "group", ["Ally", "Enemy", "Both"], "Enemy")
        .setTooltip('攻击范围内的实体群组 分别为：盟友 敌人 两者')
    );
    this.data.push(new ListValue("穿墙", "wall", ['True', 'False'], 'False')
        .setTooltip('是否允许穿墙')
    );
}

// -- Condition constructors --------------------------------------------------- //

extend('ConditionArmor', 'Component');
function ConditionArmor()
{
    this.super('Armor', Type.CONDITION, true);
    this.description = "当玩家穿戴护甲至指定槽位时，释放技能";
    
    this.data.push(new ListValue('护甲', 'armor', [ 'Helmet', 'Chestplate', 'Leggings', 'Boots', 'Any' ], 'Any')
        .setTooltip('护甲槽位，分别为：头盔 盔甲 护腿 靴子 任意')
    );
    
    addItemOptions(this);
}

extend('ConditionAttribute', 'Component');
function ConditionAttribute() 
{
    this.super('Attribute', Type.CONDITION, true);
    
    this.description = '玩家需要拥有指定属性';
    
    this.data.push(new StringValue('属性', 'attribute', '体质')
        .setTooltip('指定属性名称')
    );
    this.data.push(new AttributeValue('最小', 'min', 0, 0)
        .setTooltip('当玩家属性超过最小值时，释放技能')
    );
    this.data.push(new AttributeValue('最大', 'max', 999, 0)
        .setTooltip('当玩家属性超过最大值时，取消技能')
    );
}

extend('ConditionBiome', 'Component');
function ConditionBiome()
{
    this.super('Biome', Type.CONDITION, true);
    
    this.description = '在指定生物群系中释放技能';
    
    this.data.push(new ListValue('种类', 'type', [ 'In Biome', 'Not In Biome' ], 'In Biome')
        .setTooltip('分别为：在指定生物群系中 不在指定生物群系中')
    );
    this.data.push(new ByteListValue('生物群系', 'biome', [ 'Beach', 'Desert', 'Forest', 'Frozen', 'Hell', 'Hills', 'Ice', 'Jungle', 'Mesa', 'Mountains', 'Mushroom', 'Ocean', 'Plains', 'Plateau', 'River', 'Savanna', 'Shore', 'Sky', 'Swampland', 'Taiga' ], 1)
        .setTooltip('指定生物群系')
    );
}

extend('ConditionBlock', 'Component');
function ConditionBlock()
{
    this.super('Block', Type.CONDITION, true);
    
    this.description = '如果玩家站在指定的方块上，则释放技能';
    
    this.data.push(new ListValue('类型', 'standing', [ 'On Block', 'Not On Block' ], 'On Block')
        .setTooltip('分别为：站在指定方块上  不站在指定方块上')
    );
    this.data.push(new ListValue('指定方块', 'material', materialList, 'Dirt')
        .setTooltip('指定的方块')
    ); 
}

extend('ConditionChance', 'Component');
function ConditionChance()
{
    this.super('Chance', Type.CONDITION, true);
    
    this.description = '有几率释放技能';
    
    this.data.push(new AttributeValue('几率', 'chance', 25, 0)
        .setTooltip('百分比几率，"25"为25%.')
    );
}

extend('ConditionClass', 'Component');
function ConditionClass()
{
    this.super('Class', Type.CONDITION, true);
    
    this.description = '当玩家的职业为所写内容时，释放技能. ';
    
    this.data.push(new StringValue('职业', 'class', '战士')
        .setTooltip('玩家的职业应该是?')
    );
    this.data.push(new ListValue('精确', 'exact', [ 'True', 'False' ], 'False')
        .setTooltip('玩家职业是否为职业，如果设置为True，则只有玩家职业为战士才能使用技能，设置为Flase则反之')
    );
}

extend('ConditionClassLevel', 'Component');
function ConditionClassLevel()
{
    this.super('Class Level', Type.CONDITION, true);
    
    this.description = '当玩家职业等级达到时才会释放技能';
    
    this.data.push(new IntValue('最小等级', 'min-level', 2)
        .setTooltip('当玩家等级超过最小等级时，释放技能')
    );
    this.data.push(new IntValue('Max Level', 'max-level', 99)
        .setTooltip('当玩家等级超过最大等级时，取下技能')
    );
}

extend('ConditionCombat', 'Component');
function ConditionCombat()
{
    this.super('Combat', Type.CONDITION, true);
    
    this.description = '当玩家在 正在/退出 战斗时，释放技能';
    
    this.data.push(new ListValue('正在战斗', 'combat', [ 'True', 'False' ], 'True')
        .setTooltip('True为正在战斗，Flase为退出战斗')
    );
    this.data.push(new DoubleValue('时间(秒)', 'seconds', 10)
        .setTooltip('退出战斗多少秒后才会认为不在战斗（只适用于退出战斗）')
    );
}

extend('ConditionCrouch', 'Component');
function ConditionCrouch()
{
    this.super('Crouch', Type.CONDITION, true);
    
    this.description = '当玩家下蹲时，释放技能';
    
    this.data.push(new ListValue('下蹲', 'crouch', [ 'True', 'False' ], 'True')
        .setTooltip('玩家是否在下蹲')
    );
}

extend('ConditionDirection', 'Component');
function ConditionDirection()
{
    this.super('Direction', Type.CONDITION, true);
    
    this.description = '当 玩家/目标 面向指定方向时释放技能';
    
    this.data.push(new ListValue('类型', 'type', [ 'Target', 'Caster' ], 'Target')
        .setTooltip('Target为目标，Caster为玩家')
    );
    this.data.push(new ListValue('方向', 'direction', [ 'Away', 'Towards' ], 'Away')
        .setTooltip('所选实体的方向需要与另一个实体相对应。 分别为：离开  朝向.')
    );
}

extend('ConditionElevation', 'Component');
function ConditionElevation()
{
    this.super('Elevation', Type.CONDITION, true);
    
    this.description = '当玩家达到指定高度时释放技能';
    
    this.data.push(new ListValue('类型', 'type', [ 'Normal', 'Difference' ], 'Normal')
        .setTooltip('选择Normal代表必须在指定高度，选择Difference代表在指定高度范围内')
    );
    this.data.push(new AttributeValue('最小高度', 'min-value', 0, 0)
        .setTooltip('当玩家超过最小高度时，释放技能（Difference可用）')
    );
    this.data.push(new AttributeValue('最大高度', 'max-value', 255, 0)
        .setTooltip('当玩家超过最大高度时，取消技能（Difference可用）')
    );
}

extend('ConditionElse', 'Component');
function ConditionElse()
{
    this.super('Else', Type.CONDITION, true);
    
    this.description = '如果上一个条件未激活，则激活下一个条件(没用过)';
}

extend('ConditionEntityType', 'Component');
function ConditionEntityType()
{
    this.super('Entity Type', Type.CONDITION, true);
    
    this.description = '如果目标与选中的实体类型相同，激活技能'
    
    this.data.push(new MultiListValue('类型', 'types', [ 'BAT', 'BLAZE', 'CAVE_SPIDER', 'CHICKEN', 'COW', 'CREEPER', 'DONKEY', 'ELDER_GUARDIAN', 'ENDER_DRAGON', 'ENDERMAN', 'ENDERMITE', 'EVOKER', 'GHAST', 'GIANT', 'GUARDIAN', 'HORSE', 'HUSK', 'IRON_GOLEM', 'LLAMA', 'MAGMA_CUBE', 'MULE', 'MUSHROOM_COW', 'OCELOT', 'PIG', 'PIG_ZOMBIE', 'PLAYER', 'POLAR_BEAR', 'RABBIT', 'SHEEP', 'SHULKER', 'SILVERFISH', 'SKELETON', 'SKELETON_HORSE', 'SLIME', 'SNOWMAN', 'SPIDER', 'SQUID', 'VEX', 'VILLAGER', 'VINDICATOR', 'WITCH', 'WITHER', 'WITHER_SKELETON', 'WOLF', 'ZOMBIE', 'ZOMBIE_HORSE', 'ZOMBIE_VILLAGER' ])
        .setTooltip('选择实体类型')
    );
}

extend('ConditionFire', 'Component');
function ConditionFire()
{
    this.super('Fire', Type.CONDITION, true);
    
    this.description = '当目标燃烧时激发技能.';
    
    this.data.push(new ListValue('类型', 'type', [ 'On Fire', 'Not On Fire' ], 'On Fire')
        .setTooltip('分别为：燃烧时 燃烧结束')
    );
}

extend('ConditionFlag', 'Component');
function ConditionFlag()
{
    this.super('Flag', Type.CONDITION, true);
    
    this.description = '当目标被标记时，释放技能.';
    
    this.data.push(new ListValue('类型', 'type', [ 'Set', 'Not Set' ], 'Set')
        .setTooltip('分别为：被标记时 没被标记时')
    );
    this.data.push(new StringValue('标记名称', 'key', 'key')
        .setTooltip('标记的名称，具有唯一性，当你切换或正使用标记时，名字应与之匹配')
    );
}

extend('ConditionHealth', 'Component');
function ConditionHealth()
{
    this.super('Health', Type.CONDITION, true);

    this.description = "当目标生命状态达到指定目标时，释放技能.";
    
    this.data.push(new ListValue('类型', 'type', [ 'Health', 'Percent', 'Difference', 'Difference Percent' ], 'Health')
        .setTooltip('分别为：生命值（目标的血量）  百分比（目标血量的百分比）  差异（目标与施法者的血量差距）  差异百分比（目标与施法者的血量差距的百分比）')
    );
    this.data.push(new AttributeValue('最小数值', 'min-value', 0, 0)
        .setTooltip('当目标血量（百分比）超过最小数值时，释放技能')
    );
    this.data.push(new AttributeValue('最大数值', 'max-value', 10, 2)
        .setTooltip('当目标血量（百分比）超过最大数值时，取消技能')
    );
}

extend('ConditionItem', 'Component');
function ConditionItem()
{
    this.super('Item', Type.CONDITION, true);
    this.description = "当目标手持指定物品时，释放技能";
    
    addItemOptions(this);
}

extend('ConditionInventory', 'Component');
function ConditionInventory()
{
    this.super('Inventory', Type.CONDITION, true);
    
    this.description = '当目标物品栏中拥有指定物品时，释放技能';
    
    this.data.push(new AttributeValue('数量', 'amount', 1, 0)
        .setTooltip('玩家物品栏中所需要的物品数量')
    );
    
    addItemOptions(this);
}

extend('ConditionLight', 'Component');
function ConditionLight()
{
    this.super('Light', Type.CONDITION, true);
    
    this.description = "当目标位置的亮度到达指定数值时，释放技能";
    
    this.data.push(new AttributeValue('最小亮度', 'min-light', 0, 0)
        .setTooltip('当目标位置的光度超过最小亮度，释放技能，范围为：0-16')
    );
    this.data.push(new AttributeValue('最大亮度', 'max-light', 16, 16)
        .setTooltip('当目标位置的光度超过最大亮度，取消技能，范围为：0-16')
    );
}

extend('ConditionMana', 'Component');
function ConditionMana()
{
    this.super('Mana', Type.CONDITION, true);

    this.description = "当目标的法力值到达指定数值时，释放技能";
    
    this.data.push(new ListValue('类型', 'type', [ 'Mana', 'Percent', 'Difference', 'Difference Percent' ], 'Mana')
        .setTooltip('分别为：法力值（目标的法力值）  百分比（目标法力值的百分比）  差异（目标与施法者的法力值差距）  差异百分比（目标与施法者的法力值差距的百分比）')
    );
    this.data.push(new AttributeValue('最小数值', 'min-value', 0, 0)
        .setTooltip('当目标的法力值超过最小数值时，释放技能')
    );
    this.data.push(new AttributeValue('最大数值', 'max-value', 10, 2)
        .setTooltip('当目标的法力值小于最大数值时，取消技能')
    );
}

extend('ConditionName', 'Component');
function ConditionName()
{
    this.super('Name', Type.CONDITION, true);
    
    this.description = '当目标的名字有以下关系时，释放技能';
    
    this.data.push(new ListValue('包含文本', 'contains', [ 'True', 'False' ], 'True')
        .setTooltip('当目标的名字包含以下文本时，释放技能')
    );
    this.data.push(new ListValue('正则表达式', 'regex', [ 'True', 'False' ], 'False')
        .setTooltip('当目标的名字被正则表达式检索时，释放技能，如果你和我一样傻X不知道什么是正则表达式，忽略这个选项')
    );
    this.data.push(new StringValue('文本', 'text', 'text')
        .setTooltip('这里填写文本')
    );
}

extend('ConditionOffhand', 'Component');
function ConditionOffhand()
{
    this.super('Offhand', Type.CONDITION, true);
    this.description = "当副手物品与所描述的物品一致时，释放技能，这个设置只对1.9及以上的服务器生效";
    
    addItemOptions(this);
}

extend('ConditionPermission', 'Component');
function ConditionPermission()
{
    this.super('Permission', Type.CONDITION, true);
    
    this.description = '当施法者拥有以下权限时，释放技能';
    
    this.data.push(new StringValue('权限', 'perm', 'some.permission')
        .setTooltip('施法者所需要的权限')
    );
}

extend('ConditionPotion', 'Component');
function ConditionPotion()
{
    this.super('Potion', Type.CONDITION, true);
    
    this.description = '当目标有以下的药水效果时，释放技能';
    
    this.data.push(new ListValue('类型', 'type', [ 'Active', 'Not Active' ], 'Active')
        .setTooltip('分别为：有药水效果时 无药水效果时')
    );
    this.data.push(new ListValue('药水', 'potion', [ 'Any', 'Absorption', 'Blindness', 'Confusion', 'Damage Resistance', 'Fast Digging', 'Fire Resistance', 'Glowing', 'Health Boost', 'Hunger', 'Increase Damage', 'Invisibility', 'Jump', 'Levitation', 'Luck', 'Night Vision', 'Poison', 'Regeneration', 'Saturation', 'Slow', 'Slow Digging', 'Speed', 'Unluck', 'Water Breathing', 'Weakness', 'Wither' ], 'Any')
        .setTooltip('药水的种类')
    );
    this.data.push(new AttributeValue('最小等级', 'min-rank', 0, 0)
        .setTooltip('药水所需的最小等级')
    );
    this.data.push(new AttributeValue('最大等级', 'max-rank', 999, 0)
        .setTooltip('药水所需的最大等级')
    );
}

extend('ConditionSkillLevel', 'Component');
function ConditionSkillLevel(skill)
{
    this.super('Skill Level', Type.CONDITION, true);
    
    this.description = '当施法者的技能等级在此范围内时，释放技能，注意是施法者不是目标';
    
    this.data.push(new StringValue('技能', 'skill', skill)
        .setTooltip('你想检测等级的技能的名称，如果你想检测该技能，务必输入该技能的名称')
    );
    this.data.push(new IntValue('最小等级', 'min-level', 2)
        .setTooltip('技能的最小等级')
    );
    this.data.push(new IntValue('最大等级', 'max-level', 99)
        .setTooltip('技能的最大等级')
    );
}

extend('ConditionSlot', 'Component');
function ConditionSlot()
{
    this.super('Slot', Type.CONDITION, true);
    this.description = "当玩家的槽位内有以下物品时，释放技能";
    
    this.data.push(new StringListValue('槽位（每行一个）', 'slot', [9])
        .setTooltip('槽位的位置 0-8代表快捷栏 9-35代表物品栏 36-39是护甲栏 40是副手 会检查任何一个槽位是否符合条件')
    );
    
    addItemOptions(this);
}

extend('ConditionStatus', 'Component');
function ConditionStatus()
{
    this.super('Status', Type.CONDITION, true);
    
    this.description = '当目标有以下状态时释放技能';
    
    this.data.push(new ListValue('类型', 'type', [ 'Active', 'Not Active' ], 'Active')
        .setTooltip('分别为：有此状态则释放 无此状态则释放')
    );
    this.data.push(new ListValue('状态', 'status', [ 'Any', 'Curse', 'Disarm', 'Root', 'Silence', 'Stun' ], 'Any')
        .setTooltip('所需的状态，分别为任何状态 诅咒 缴械 禁锢 沉默 眩晕')
    );
}

extend('ConditionTime', 'Component');
function ConditionTime()
{
    this.super('Time', Type.CONDITION, true);
    
    this.description = '当这个世界时间有以下情况时，释放技能';
    
    this.data.push(new ListValue('时间', 'time', [ 'Day', 'Night' ], 'Day')
        .setTooltip('当前世界的时间 分别为：白天 黑夜')
    );
}

extend('ConditionTool', 'Component');
function ConditionTool()
{
    this.super('Tool', Type.CONDITION, true);
    
    this.description = '当目标挥舞着以下工具时，释放技能';
    
    this.data.push(new ListValue('材料', 'material', [ 'Any', 'Wood', 'Stone', 'Iron', 'Gold', 'Diamond' ], 'Any')
        .setTooltip('工具的材料，分别为 任何材料 木头 石头 铁 金 钻石')
    );
    this.data.push(new ListValue('工具', 'tool', [ 'Any', 'Axe', 'Hoe', 'Pickaxe', 'Shovel', 'Sword' ], 'Any')
        .setTooltip('工具的类型，分别为 任何类型 斧子 锄头 稿子 铲子 剑')
    );
}

extend('ConditionValue', 'Component');
function ConditionValue()
{
    this.super('Value', Type.CONDITION, true);
    
    this.description = '当目标的效果的值在以下范围内时，释放技能';
    
    this.data.push(new StringValue('效果', 'key', 'value')
        .setTooltip('目标的效果')
    );
    this.data.push(new AttributeValue('最小值', 'min-value', 1, 0)
        .setTooltip('目标效果的最小值')
    );
    this.data.push(new AttributeValue('最大值', 'max-value', 999, 0)
        .setTooltip('目标效果的最大值')
    );
}

extend('ConditionWater', 'Component');
function ConditionWater()
{
    this.super('Water', Type.CONDITION, true);
    
    this.description = '当目标在或不在水中时，释放技能，这取决于设置';
    
    this.data.push(new ListValue('情况', 'state', [ 'In Water', 'Out Of Water' ], 'In Water')
        .setTooltip('分别为：在水中 不在水中')
    );
}

// -- Mechanic constructors ---------------------------------------------------- //

extend('MechanicAttribute', 'Component');
function MechanicAttribute()
{
    this.super('Attribute', Type.MECHANIC, false);
    
    this.description = '给予玩家一定时间的属性加成';
    
    this.data.push(new StringValue('属性', 'key', 'Intelligence')
        .setTooltip('需要加成的属性')
    );
    this.data.push(new AttributeValue('数值', 'amount', 5, 2)
        .setTooltip('添加属性的数值')
    );
    this.data.push(new AttributeValue('时间', 'seconds', 3, 0)
        .setTooltip('加成的时间')
    );
}

extend('MechanicBlock', 'Component');
function MechanicBlock() 
{
    this.super('Block', Type.MECHANIC, false);
    
    this.description = '在一定时间内将指定地区的方块替换为指定方块';
    
    this.data.push(new ListValue('形状', 'shape', [ 'Sphere', 'Cuboid' ], 'Sphere' )
        .setTooltip('生成的形状，分别为球体 长方体')
    );
    this.data.push(new ListValue('方式', 'type', [ 'Air', 'Any', 'Solid' ], 'Solid' )
        .setTooltip('方块替换的方式，分别为：替换空气 替换所有方块 替换非空气方块')
    );
    this.data.push(new ListValue('方块', 'block', materialList, 'Ice')
        .setTooltip('替换成的方块种类')
    );
    this.data.push(new IntValue('方块数据', 'data', 0)
        .setTooltip('方块的数据值，主要用于牌子，羊毛，地毯以及类似方块')
    );
    this.data.push(new AttributeValue('时间', 'seconds', 5, 0)
        .setTooltip('方块替换的时间')
    );
    this.data.push(new AttributeValue('向前偏移', 'forward', 0, 0)
        .setTooltip('在目标向前偏移的位置生成方块，负数则向后偏移')
    );
    this.data.push(new AttributeValue('向上偏移', 'upward', 0, 0)
        .setTooltip('在目标向上偏移的位置生成方块，负数则向下偏移')
    );
    this.data.push(new AttributeValue('向右偏移', 'right', 0, 0)
        .setTooltip('在目标向右偏移的位置生成方块，负数则向左偏移')
    );
    
    // Sphere options
    this.data.push(new AttributeValue('半径', 'radius', 3, 0).requireValue('shape', [ 'Sphere' ])
        .setTooltip('球体区域的半径')
    );
    
    // Cuboid options
    this.data.push(new AttributeValue('宽 (X)', 'width', 5, 0).requireValue('shape', [ 'Cuboid' ])
        .setTooltip('长方体的宽')
    );
    this.data.push(new AttributeValue('长 (Y)', 'height', 5, 0).requireValue('shape', [ 'Cuboid' ])
        .setTooltip('长方体的长')
    );
    this.data.push(new AttributeValue('高 (Z)', 'depth', 5, 0).requireValue('shape', [ 'Cuboid' ])
        .setTooltip('长方体的高')
    );
}

extend('MechanicCancel', 'Component');
function MechanicCancel()
{
    this.super('Cancel', Type.MECHANIC, false);
    
    this.description = '取消触发器造成的伤害.例如，基于伤害的触发器将会防止由于“启动”触发器造成的伤害，从而阻止造成伤害|就是没有最终效果';
}

extend('MechanicCancelEffect', 'Component');
function MechanicCancelEffect()
{
    this.super('Cancel Effect', Type.MECHANIC, false);
    
    this.description = '取消状态';
    
    this.data.push(new StringValue('状态名称', 'effect-key', 'default')
        .setTooltip('状态的名称')
    );
}

extend('MechanicChannel', 'Component');
function MechanicChannel()
{
    this.super('Channel', Type.MECHANIC, true);
    
    this.description = '吟唱后才可以释放子技能，期间玩家无法移动，攻击或释放其他技能';
    
    this.data.push(new ListValue('静止', 'still', [ 'True', 'False' ], 'True')
        .setTooltip('吟唱时能否移动')
    );
    this.data.push(new AttributeValue('时间', 'time', 3, 0)
        .setTooltip('吟唱的时间，单位是秒')
    );
}

extend('MechanicCleanse', 'Component');
function MechanicCleanse()
{
    this.super('Cleanse', Type.MECHANIC, false);
    
    this.description = '清除目标指定的负面药水和状态';
    
    this.data.push(new ListValue('药水', 'potion', [ 'None', 'All', 'Blindness', 'Confusion', 'Hunger', 'Levitation', 'Poison', 'Slow', 'Slow Digging', 'Weakness', 'Wither' ], 'All')
        .setTooltip('药水状态，分别为：没有 所有 失明 反胃 饥饿 浮空 中毒 缓慢 挖掘疲劳 虚弱 凋零')
    );
    this.data.push(new ListValue('状态', 'status', [ 'None', 'All', 'Curse', 'Disarm', 'Root', 'Silence', 'Stun' ], 'All')
        .setTooltip('状态，分别为：没有 所有 诅咒 缴械 禁锢 沉默 眩晕')
    );
}

extend('MechanicCommand', 'Component');
function MechanicCommand()
{
    this.super('Command', Type.MECHANIC, false);
    
    this.description ='对每个目标执行一项命令，由控制台或将目标玩家视为op身份执行';
    
    this.data.push(new StringValue('指令', 'command', '')
        .setTooltip('所需执行的指令')
    );
    this.data.push(new ListValue('执行类型', 'type', [ 'Console', 'OP' ], 'OP')
        .setTooltip('如何执行指令 分别为：由控制台执行 将目标玩家视为op身份执行 使用{player}来代替玩家名称')
    );
}

extend('MechanicCooldown', 'Component');
function MechanicCooldown()
{
    this.super('Cooldown', Type.MECHANIC, false);
    
    this.description = "降低一个或所有技能的冷却，如果值为负数，则增加冷却";
    
    this.data.push(new StringValue('技能名称 或填 all 即所有技能', 'skill', 'all')
        .setTooltip('需要减少冷却的技能')
    );
    this.data.push(new ListValue('类型', 'type', [ 'Seconds', 'Percent' ], 'Seconds')
        .setTooltip('减少的类型，分别为：减少指定时间 减少百分比时间')
    );
    this.data.push(new AttributeValue('数值', 'value', -1, 0)
        .setTooltip('减少的数值')
    );
}

extend('MechanicDamage', 'Component');
function MechanicDamage()
{
    this.super('Damage', Type.MECHANIC, false);
    
    this.description = '对目标造成指定的伤害';
    
    this.data.push(new ListValue('类型', 'type', [ 'Damage', 'Multiplier', 'Percent Left', 'Percent Missing' ], 'Damage')
        .setTooltip('对目标造成的伤害类型。 Damage:对目标造成指定的伤害数值, Multiplier:对目标造成最大血量的百分比的伤害数值, Percent Left:对目标造成剩余血量的百分比的伤害数值, Percent Missing:对目标造成最大血量及当前血量之间的差距的百分比的伤害')
    );
    this.data.push(new AttributeValue("数值", "value", 3, 1)
        .setTooltip('造成伤害的数值')
    );
    this.data.push(new ListValue('真实伤害', 'true', [ 'True', 'False' ], 'False')
        .setTooltip('是否对目标造成真实伤害(参考LOL)，无视盔甲、属性、状态以及药水效果')
    );
}

extend('MechanicDamageBuff', 'Component');
function MechanicDamageBuff()
{
    this.super('Damage Buff', Type.MECHANIC, false);
    
    this.description = '设置造成的伤害Buff';
    
    this.data.push(new ListValue('类型', 'type', [ 'Flat', 'Multiplier' ], 'Flat')
        .setTooltip('设置Buff类型. Flat:增加/减少指定的伤害 Multiplier:按百分比来增加/减少伤害（示例： 增加5%伤害即为 1.05 减少5%伤害即为 0.95）')
    );
    this.data.push(new ListValue('技能伤害', 'skill', [ 'True', 'False' ], 'False')
        .setTooltip('是否增加/减少技能伤害，如果为False则增加/减少物理伤害')
    );
    this.data.push(new AttributeValue('数值', 'value', 1, 0)
        .setTooltip('增加/减少的伤害数值')
    );
    this.data.push(new AttributeValue('时间/秒', 'seconds', 3, 0)
        .setTooltip('当前Buff的持续时间')
    );
}

extend('MechanicDamageLore', 'Component');
function MechanicDamageLore()
{
    this.super('Damage Lore', Type.MECHANIC, false);
    
    this.description = '当玩家手持的物品拥有指定Lore时，按照Lore来造成伤害';
    
    this.data.push(new ListValue("手部", "hand", [ 'Main', 'Offhand' ], 'Main')
        .setTooltip('检测为主手物品还是副手物品（副手仅用于1.9+）')
    );
    this.data.push(new StringValue('正则表达式', 'regex', 'Damage: {value}')
        .setTooltip('文本的正则表达式，不会就别填了({value}为伤害数值)')
    );
    this.data.push(new AttributeValue('攻击倍数', 'multiplier', 1, 0)
        .setTooltip('{value}中所填数值的倍数')
    );
    this.data.push(new ListValue('真实伤害', 'true', [ 'True', 'False' ], 'False')
        .setTooltip('是否对目标造成真实伤害(参考LOL)，无视盔甲、属性、状态以及药水效果')
    );
}

extend('MechanicDefenseBuff', 'Component');
function MechanicDefenseBuff()
{
    this.super('Defense Buff', Type.MECHANIC, false);
    
    this.description = '持续时间内，修改受到的伤害数值. 负标志量或小于1的乘数将减少所遭受的伤害，而相反则会增加伤害。 （例如，5％的伤害减免buff应把Multiplier设成0.95，因为你将遭受95％的伤害)';
    
    this.data.push(new ListValue('类型', 'type', [ 'Flat', 'Multiplier' ], 'Flat')
        .setTooltip('所添加buff的类型 Flat会增加/减少受到伤害的数值 Multiplier会增加/减少受到伤害的百分比')
    );
    this.data.push(new ListValue('技能伤害', 'skill', [ 'True', 'False' ], 'False')
        .setTooltip('是否增加/减少技能伤害，如果为False则增加/减少物理伤害')
    );
    this.data.push(new AttributeValue('数值', 'value', 1, 0)
        .setTooltip('增加/减少的伤害数值')
    );
    this.data.push(new AttributeValue('时间/秒', 'seconds', 3, 0)
        .setTooltip('当前Buff的持续时间')
    );
}

extend('MechanicDelay', 'Component');
function MechanicDelay()
{
    this.super('Delay', Type.MECHANIC, true);
    
    this.description = '在一定延迟后释放子技能';
    
    this.data.push(new AttributeValue('延迟', 'delay', 2, 0)
        .setTooltip('释放子技能前的延迟，单位是秒')
    );
}

extend('MechanicDisguise', 'Component');
function MechanicDisguise()
{
    this.super('Disguise', Type.MECHANIC, false);
    
    this.description = '通过设置将目标伪装. 需要有LibsDisguise插件在你的服务端';
    
    this.data.push(new AttributeValue('持续时间', 'duration', -1, 0)
        .setTooltip('伪装持续的时间，如果是负数则永久伪装')
    );
    this.data.push(new ListValue('类型', 'type', [ 'Mob', 'Player', 'Misc' ], 'Mob')
        .setTooltip('需要伪装成的类型，应被LibsDisguise插件所支持')
    );
    
    this.data.push(new ListValue('生物', 'mob', [ 'Bat', 'Blaze', 'Cave Spider', 'Chicken', 'Cow', 'Creeper', 'Donkey', 'Elder Guardian', 'Ender Dragon', 'Enderman', 'Endermite', 'Ghast', 'Giant', 'Guardian', 'Horse', 'Iron Golem', 'Magma Cube', 'Mule', 'Mushroom Cow', 'Ocelot', 'Pig', 'Pig Zombie', 'Rabbit', 'Sheep', 'Shulker', 'Silverfish', 'Skeleton', 'Slime', 'Snowman', 'Spider', 'Squid', 'Undead Horse', 'Villager', 'Witch', 'Wither', 'Wither Skeleton', 'Wolf', 'Zombie', 'Zombie Villager'], 'Zombie')
        .requireValue('生物', [ 'Mob' ])
        .setTooltip('伪装成怪物的类型 分别为生物 玩家 杂项')
    );
    this.data.push(new ListValue('成体', 'adult', [ 'True', 'False', ], 'True')
        .requireValue('type', [ 'Mob' ])
        .setTooltip('生物是否为成体 如小鸡与大鸡')
    );
    
    this.data.push(new StringValue('玩家', 'player', 'Eniripsa96')
        .requireValue('type', [ 'Player' ])
        .setTooltip('需要伪装成的玩家')
    );
    
    this.data.push(new ListValue('杂项', 'misc', [ 'Area Effect Cloud', 'Armor Stand', 'Arrow', 'Boat', 'Dragon Fireball', 'Dropped Item', 'Egg', 'Ender Crystal', 'Ender Pearl', 'Ender Signal', 'Experience Orb', 'Falling Block', 'Fireball', 'Firework', 'Fishing Hook', 'Item Frame', 'Leash Hitch', 'Minecart', 'Minecart Chest', 'Minecart Command', 'Minecart Furnace', 'Minecart Hopper', 'Minecart Mob Spawner', 'Minecart TNT', 'Painting', 'Primed TNT', 'Shulker Bullet', 'Snowball', 'Spectral Arrow', 'Splash Potion', 'Tipped Arrow', 'Thrown EXP Bottle', 'Wither Skull' ], 'Painting')
        .requireValue('type', [ 'Misc' ])
        .setTooltip('伪装成的物体')
    );
    this.data.push(new IntValue('数据值', 'data', 0)
        .requireValue('type', [ 'Misc' ])
        .setTooltip('物品的数据值，应被LibsDisguise插件所支持')
    );
}

extend('MechanicExplosion', 'Component');
function MechanicExplosion()
{
    this.super('Explosion', Type.MECHANIC, false);
    
    this.description = '立刻在目标区域造成一次爆炸';
    
    this.data.push(new AttributeValue('强度', 'power', 3, 0)
        .setTooltip('造成的强度')
    );
    this.data.push(new ListValue('破坏方块', 'damage', [ 'True', 'False' ], 'False')
        .setTooltip('是否破坏方块')
    );
    this.data.push(new ListValue('着火', 'fire', [ 'True', 'False' ], 'False')
        .setTooltip('是否使方块着火')
    );
}

extend('MechanicFire', 'Component');
function MechanicFire()
{
    this.super('Fire', Type.MECHANIC, false);
    
    this.description = '引燃目标一段时间';
    
    this.data.push(new AttributeValue('时间', 'seconds', 3, 1)
        .setTooltip('引燃目标的时间，单位是秒')
    );
}

extend('MechanicFlag', 'Component');
function MechanicFlag()
{
    this.super('Flag', Type.MECHANIC, false);
    
    this.description = '标记目标一段时间. 标记可以通过其他触发器，法术或相关的有趣的协同作用和效果来检查.';
    
    this.data.push(new StringValue('关键词|标记名称', 'key', 'key')
        .setTooltip('表示标记的唯一关键词，在其他设置下使用相同关键词检查标记')
    );
    this.data.push(new AttributeValue('时间', 'seconds', 3, 1)
        .setTooltip('标记的持续时间，使用标记切换功能(后面有)来设置无限期')
    ); 
}

extend('MechanicFlagClear', 'Component');
function MechanicFlagClear()
{
    this.super('Flag Clear', Type.MECHANIC, false);
    
    this.description = '清除目标的标记';
    
    this.data.push(new StringValue('关键词|标记名称', 'key', 'key')
        .setTooltip('表示标记的唯一关键词，需要进行其他的设置来施加标记')
    );
}

extend('MechanicFlagToggle', 'Component');
function MechanicFlagToggle()
{
    this.super('Flag Toggle', Type.MECHANIC, false);
    
    this.description = '切换标记的有无，可以被用来切换状态';
    
    this.data.push(new StringValue('关键词|标记名称', 'key', 'key')
        .setTooltip('表示标记的唯一关键词，在其他设置下使用相同关键词检查标记')
    );
}

extend('MechanicForgetTargets', 'Component');
function MechanicForgetTargets() 
{
    this.super('Forget Targets', Type.MECHANIC, false);
    
    this.description = '清除从‘记住目标（很后面有）’那的存储';
    
    this.data.push(new StringValue('关键词', 'key', 'key')
        .setTooltip('存储目标的唯一关键词')
    );
}

extend('MechanicHeal', 'Component');
function MechanicHeal()
{
    this.super('Heal', Type.MECHANIC, false);
    
    this.description = '恢复每个目标的健康';
    
    this.data.push(new ListValue("类型", "type", [ "Health", "Percent" ], "Health")
        .setTooltip('治疗的类型，分别为：普通治疗 百分比治疗 百分比是按目标的最大血量')
    );
    this.data.push(new AttributeValue("数值", "value", 3, 1)
        .setTooltip('治疗的数值')
    );
}

extend('MechanicHeldItem', 'Component');
function MechanicHeldItem()
{
    this.super('Held Item', Type.MECHANIC, false);
    
    this.description = '将目标手持的物品移动到目标的槽位中，如果槽位是技能快捷键将会无效';
    
    this.data.push(new AttributeValue("槽位", "slot", 0, 0)
        .setTooltip('所移动到的槽位')
    );
}

extend('MechanicImmunity', 'Component');
function MechanicImmunity()
{
    this.super('Immunity', Type.MECHANIC, false);
    
    this.description = '在一段时间内免疫指定的伤害'
    
    this.data.push(new ListValue('类型', 'type', DAMAGE_TYPES, 'Poison')
        .setTooltip('伤害的类型')
    );
    this.data.push(new AttributeValue('时间', 'seconds', 3, 0)
        .setTooltip('免疫伤害持续的时间')
    );
    this.data.push(new AttributeValue('百分比免疫', 'multiplier', 0, 0)
        .setTooltip('免疫伤害的百分比，设成0则完全免疫')
    );
}

extend('MechanicInterrupt', 'Component');
function MechanicInterrupt()
{
    this.super('Interrupt', Type.MECHANIC, false);
    
    this.description = '中断每个目标的吟唱（如果适用）';
}

extend('MechanicItem', 'Component');
function MechanicItem()
{
    this.super('Item', Type.MECHANIC, false);
    
    this.description = '给予目标指定的物品';
    
    this.data.push(new ListValue('物品', 'material', materialList, 'Arrow')
        .setTooltip('给予物品的类型')
    );
    this.data.push(new IntValue('数量', 'amount', 1)
        .setTooltip('给予物品的数量')
    );
    this.data.push(new IntValue('耐久', 'data', 0)
        .setTooltip('给予物品的耐久')
    );
    this.data.push(new IntValue('数据', 'byte', 0)
        .setTooltip('物品的数据值，如羊毛的颜色')
    );
    this.data.push(new ListValue('高级', 'custom', [ 'True', 'False' ], 'False')
        .setTooltip('给予的物品是否需要有名字和lore')
    );
    
    this.data.push(new StringValue('名字', 'name', 'Name').requireValue('custom', [ 'True' ])
        .setTooltip('物品的名字')
    );
    this.data.push(new StringListValue('Lore', 'lore', []).requireValue('custom', [ 'True' ])
        .setTooltip('物品的lore，在名字的下方')
    );
}

extend('MechanicItemProjectile', 'Component');
function MechanicItemProjectile()
{
    this.super('Item Projectile', Type.MECHANIC, true);
    
    this.description = '发射一个抛射物，着陆时变为方块. 未着陆时可以撞击经过的目标.';
    
    
    this.data.push(new ListValue('物品', 'item', materialList, 'Jack O Lantern')
        .setTooltip('作为抛射物的物品')
    ),
    this.data.push(new IntValue('物品数据', 'item-data', 0)
        .setTooltip('物品的数据值，适用于彩色羊毛以及类似物品')
    ),
    
    addProjectileOptions(this);
    addEffectOptions(this, true);
}

extend('MechanicItemRemove', 'Component');
function MechanicItemRemove()
{
    this.super('Item Remove', Type.MECHANIC, false);
    
    this.description = '从玩家的背包中删除物品，对怪物无效';
    
    this.data.push(new AttributeValue('数量', 'amount', 1, 0)
        .setTooltip('删除物品的数量 注意：该数量的物品需要在玩家背包内')
    );
    
    addItemOptions(this);
}

extend('MechanicLaunch', 'Component');
function MechanicLaunch()
{
    this.super('Launch', Type.MECHANIC, false);
    
    this.description = '使目标向一个方向位移一段距离，如果值是负数，则向反方向冲刺|韩信？)';
    
    this.data.push(new AttributeValue('向前速度', 'forward', 0, 0)
        .setTooltip('给予目标向前的位移速度')
    );
    this.data.push(new AttributeValue('向上速度', 'upward', 2, 0.5)
        .setTooltip('给予目标向上的位移速度')
    );
    this.data.push(new AttributeValue('向右速度', 'right', 0, 0)
        .setTooltip('给予目标向右的位移速度')
    );
}

extend('MechanicLightning', 'Component');
function MechanicLightning()
{
    this.super('Lightning', Type.MECHANIC, false);
    
    this.description = '向目标或目标附近释放闪电，负值则向反方向释放';
    
    this.data.push(new ListValue('伤害', 'damage', ['True', 'False'], 'True')
        .setTooltip('闪电是否造成伤害')
    );
    this.data.push(new AttributeValue('向前偏移', 'forward', 0, 0)
        .setTooltip('在目标位置前方位置释放闪电')
    );
    this.data.push(new AttributeValue('向右偏移', 'right', 0, 0)
        .setTooltip('在目标位置前右位置释放闪电')
    );
}

extend('MechanicMana', 'Component');
function MechanicMana()
{
    this.super('Mana', Type.MECHANIC, false);
    
    this.description = '扣或回复目标法力值';
    
    this.data.push(new ListValue('类型', 'type', [ 'Mana', 'Percent' ], 'Mana')
        .setTooltip('扣除的类型，分别为数值扣除，百分比扣除')
    );
    this.data.push(new AttributeValue('数值', 'value', 1, 0)
        .setTooltip('扣除的数值')
    );
}

extend('MechanicMessage', 'Component');
function MechanicMessage()
{
    this.super('Message', Type.MECHANIC, false);
    
    this.description = '向每个玩家发送信息，如果要包含value插件的数值，请使用 {<key>} ，其中 <key>是value储存的值}'
    
    this.data.push(new StringValue('信息', 'message', 'text')
        .setTooltip('所要发送的信息')
    );
}

extend('MechanicParticle', 'Component');
function MechanicParticle()
{
    this.super('Particle', Type.MECHANIC, false);
    
    this.description = '在目标处释放粒子';
    
    addParticleOptions(this);
    
    this.data.push(new DoubleValue('向前偏移', 'forward', 0)
        .setTooltip('在目标向前偏移的位置释放粒子，负数则向后偏移')
    );
    this.data.push(new DoubleValue('向上偏移', 'upward', 0)
        .setTooltip('在目标向上偏移的位置释放粒子，负数则向下偏移')
    );
    this.data.push(new DoubleValue('向右偏移', 'right', 0)
        .setTooltip('在目标向右偏移的位置释放粒子，负数则向左偏移')
    );
}

extend('MechanicParticleAnimation', 'Component');
function MechanicParticleAnimation()
{
    this.super('Particle Animation', Type.MECHANIC, false);
    
    this.description = '通过各种设置，在每个目标的位置播放动画粒子效果';
    
    this.data.push(new IntValue('次数', 'steps', 1, 0)
        .setTooltip('播放粒子的次数并应用每个应用的次数')
    );
    this.data.push(new DoubleValue('频率', 'frequency', 0.05, 0)
        .setTooltip('应用动画的频率，0.05是最快（1刻）低于此将会相同。')
    );
    this.data.push(new IntValue('角度', 'angle', 0)
        .setTooltip('动画在一定时间内旋转的距离')
    );
    this.data.push(new IntValue('起始角度', 'start', 0)
        .setTooltip('动画的开始方向 水平升降和向前/向右偏移将基于此。')
    );
    this.data.push(new AttributeValue('持续时间', 'duration', 5, 0)
        .setTooltip('动画持续的时间')
    );
    this.data.push(new AttributeValue('水平收缩', 'h-translation', 0, 0)
        .setTooltip('动画在一个周期内相对于中心水平移动的距离 正值使其从中心扩展，而负值使向中间合拢')
    );
    this.data.push(new AttributeValue('垂直升降', 'v-translation', 0, 0)
        .setTooltip('动画在一个周期内垂直移动的距离 正值使其上升，而负值使其下降。')
    );
    this.data.push(new IntValue('水平收缩次数', 'h-cycles', 1)
        .setTooltip('在整个动画中水平移动动画位置的次数 每隔一个循环将其移回到起始位置 例如，两个周期会将其扩展，然后重新合拢')
    );
    this.data.push(new IntValue('垂直升降速度', 'v-cycles', 1)
        .setTooltip('在整个动画中垂直移动动画位置的次数 每隔一个循环将其移回到起始位置 例如，两个周期会将其上升，然后下降')
    );
    
    addParticleOptions(this);
    
    this.data.push(new DoubleValue('向前偏移', 'forward', 0)
        .setTooltip('在目标前方有多远，以块为单位释放粒子 负值将偏后')
    );
    this.data.push(new DoubleValue('向上偏移', 'upward', 0)
        .setTooltip('在目标上方有多远，以块为单位释放粒子 负值将偏下')
    );
    this.data.push(new DoubleValue('向右偏移', 'right', 0)
        .setTooltip('在目标右方有多远，以块为单位释放粒子 负值将偏左')
    );
}

extend('MechanicParticleEffect', 'Component');
function MechanicParticleEffect()
{
    this.super('颗粒状态', Type.MECHANIC, false);
    
    this.description = '使用公式来确定形状，大小和运动，然后播放跟随当前目标的粒子效果';
    
    addEffectOptions(this, false);
}

extend('MechanicParticleProjectile', 'Component');
function MechanicParticleProjectile()
{
    this.super('Particle Projectile', Type.MECHANIC, true);
    
    this.description = '发射一个粒子效果，着陆时变为方块. 未着陆时可以撞击经过的目标';
    
    addProjectileOptions(this);
    addParticleOptions(this);
    
    this.data.push(new DoubleValue('频率', 'frequency', 0.05)
        .setTooltip('释放粒子的频率 建议不要更改此值，除非播放的粒子太多')
    );
    this.data.push(new DoubleValue('冷却', 'lifespan', 3)
        .setTooltip('抛射体在几秒钟之内将会过期多长时间，以免发生任何事情')
    );
    
    addEffectOptions(this, true);
}

extend('MechanicPassive', 'Component');
function MechanicPassive()
{
    this.super('Passive', Type.MECHANIC, true);
    
    this.description = '不间断地应用子组件。 下面的秒值是应用的周期或频率。';
    
    this.data.push(new AttributeValue('时间', 'seconds', 1, 0)
        .setTooltip('每个应用程序之间的延迟')
    );
}

extend('MechanicPermission', 'Component');
function MechanicPermission()
{
    this.super('Permission', Type.MECHANIC, true);
    
    this.description = '给予每个玩家在有限的时间内的权限。 这个功能要求Vault具有附带的权限插件才能工作';
    
    this.data.push(new StringValue('权限', 'perm', 'plugin.perm.key')
        .setTooltip('想给予玩家的权限')
    );
    this.data.push(new AttributeValue('时间', 'seconds', 3, 0)
        .setTooltip('给予玩家权限的时间')
    );
}

extend('MechanicPotion', 'Component');
function MechanicPotion()
{
    this.super('Potion', Type.MECHANIC, false);
    
    this.description = '对目标造成药水效果';
    
    this.data.push(new ListValue('药水效果', 'potion', [ 'Absorption', 'Blindness', 'Confusion', 'Damage Resistance', 'Fast Digging', 'Fire Resistance', 'Glowing', 'Health Boost', 'Hunger', 'Increase Damage', 'Invisibility', 'Jump', 'Levitation', 'Luck', 'Night Vision', 'Poison', 'Regeneration', 'Saturation', 'Slow', 'Slow Digging', 'Speed', 'Unluck', 'Water Breathing', 'Weakness', 'Wither' ], 'Absorption')
        .setTooltip('所造成的药水效果')
    );
    this.data.push(new ListValue('粒子效果', 'ambient', [ 'True', 'False' ], 'True')
        .setTooltip('是否显示粒子效果')
    );
    this.data.push(new AttributeValue('药水等级', 'tier', 1, 0)
        .setTooltip('药水效果等级')
    );
    this.data.push(new AttributeValue('时间/秒', 'seconds', 3, 1)
        .setTooltip('药水效果持续时间')
    );
}

extend('MechanicPotionProjectile', 'Component');
function MechanicPotionProjectile()
{
    this.super('Potion Projectile', Type.MECHANIC, true);
    
    this.description = '从每一个目标身上掉落一个没有任何效果的药水，当药水掉落时，将应用子元素，目标为药水所命中的单位，如果未命中，目标将是其掉落的位置';
    
    this.data.push(new ListValue('视觉效果', 'type', [ 'Fire Resistance', 'Instant Damage', 'Instant Heal', 'Invisibility', 'Night Vision', 'Poison', 'Regen', 'Slowness', 'Speed', 'Strength', 'Water', 'Water Breathing', 'Weakness' ], 'Fire Resistance')
        .setTooltip('视觉上的药水效果(不会造成真实效果)')
    );
    this.data.push(new ListValue("群组", "group", ["Ally", "Enemy", "Both"], "Enemy")
        .setTooltip('攻击范围内的实体群组 分别为：盟友 敌人 两者')
    );
    this.data.push(new ListValue('龙息', 'linger', [ 'True', 'False' ], 'False')
        .setTooltip('药水是否为龙息型药水（适用于1.9及以上）')
    );
}

extend('MechanicProjectile', 'Component');
function MechanicProjectile()
{
    this.super('Projectile', Type.MECHANIC, true);
    
    this.description = '发射一个抛射物后应用子元素，目标为抛射物所击中的单位';
    
    this.data.push(new ListValue('抛射物', 'projectile', [ 'Arrow', 'Egg', 'Ghast Fireball', 'Snowball' ], 'Arrow')
        .setTooltip('当前抛射物类型，分别为：箭矢  鸡蛋  火球  雪球')
    );
    this.data.push(new ListValue('燃烧', 'flaming', [ 'True', 'False' ], 'False')
        .setTooltip('抛射物是否附带燃烧效果.')
    );
    this.data.push(new ListValue('消耗', 'cost', [ 'None', 'All', 'One' ], 'None')
        .setTooltip('释放技能时是否消耗相应的抛射物。')
    );
    
    addProjectileOptions(this);
    addEffectOptions(this, true);
}

extend('MechanicPurge', 'Component');
function MechanicPurge() 
{
    this.super('Purge', Type.MECHANIC, false);
    
    this.description = '消除目标身上的所有正面以及负面效果';
    
    this.data.push(new ListValue('药水效果', 'potion', [ 'None', 'All', 'Absorption', 'Damage Resistance', 'Fast Digging', 'Fire Resistance', 'Health Boost', 'Increase Damage', 'Invisibility', 'Jump', 'Night Vision', 'Regeneration', 'Saturation', 'Speed', 'Water Breathing' ], 'All')
        .setTooltip('净化目标身上相应的药水效果，默认为所有')
    );
    this.data.push(new ListValue('状态', 'status', [ 'None', 'All', 'Absorb', 'Invincible' ], 'All')
        .setTooltip('净化目标身上相应的状态，默认为所有')
    );
}

extend('MechanicPush', 'Component');
function MechanicPush()
{
    this.super('Push', Type.MECHANIC, false);
    
    this.description = '对目标造成击退效果，如果目标为释放者，将不起任何作用，正数为击退，负数为前进';
    
  this.data.push(new ListValue('击退效果', 'type', [ 'Fixed', 'Inverse', 'Scaled' ], 'Fixed')
    .setTooltip('Fixed：所有目标都以固定速度被击退，Inverse:逆向推动敌人将速度更快，距离更远. Scaled:按比例推动敌人.')
  );
    this.data.push(new AttributeValue('Speed', 'speed', 3, 1)
      .setTooltip('击退程度，负数即为拉过来')
  );
}

extend('MechanicRememberTargets', 'Component');
function MechanicRememberTargets()
{
    this.super('Remember Targets', Type.MECHANIC, false);
    
    this.description = '保存当前的目标以用于在之后使用。';
    
    this.data.push(new StringValue('Key', 'key', 'target')
        .setTooltip('"Remember"处的Key所填内容（目标Key).')
    );
}

extend('MechanicRepeat', 'Component');
function MechanicRepeat()
{
    this.super('Repeat', Type.MECHANIC, true);
    
    this.description = '连续多次应用子元素.';
    
    this.data.push(new AttributeValue('重复次数', 'repetitions', 3, 0)
        .setTooltip('将会应用多少次子元素')
    );
    this.data.push(new DoubleValue('周期', 'period', 1)
        .setTooltip('每次应用多少秒子元素')
    );
    this.data.push(new DoubleValue('延迟', 'delay', 0)
        .setTooltip('每个子元素之间的间隔时间')
    );
}

extend('MechanicSound', 'Component');
function MechanicSound()
{
    this.super('Sound', Type.MECHANIC, false);
    
    this.description = "在目标位置播放指定声音";
    
    this.data.push(new ListValue('服务器版本', 'version', [ '1.9+', 'Pre 1.9' ], '1.9+')
        .setTooltip('分别为:1.9及以上 1.9以下(不包括1.9)')
    );
    
    this.data.push(new ListValue('声音', 'newsound', SOUNDS_POST, 'Ambience Cave').requireValue('version', [ '1.9+' ])
        .setTooltip('播放的声音,适用于1.9及以上')
    );
    this.data.push(new ListValue('声音', 'sound', SOUNDS_PRE, 'Ambience Cave').requireValue('version', [ 'Pre 1.9' ])
        .setTooltip('播放的声音，适用于1.9以下')
    );
    
    this.data.push(new AttributeValue('音量', 'volume', 100, 0)
        .setTooltip('音量的百分比，100以上的音量声音并不会变大，但是可以从更远的地方听到')
    );
    this.data.push(new AttributeValue('音高', 'pitch', 1, 0)
        .setTooltip('声音的音高，范围:0.5-2')
    );
}

extend('MechanicSpeed', 'Component');
function MechanicSpeed()
{
    this.super('Speed', Type.MECHANIC, false);
    
    this.description = '修改玩家速度到达基本速度(包括药水)的数倍';
    
    this.data.push(new AttributeValue('倍数', 'multiplier', 1.2, 0)
        .setTooltip('玩家基本速度的倍数')
    );
    this.data.push(new AttributeValue('持续时间', 'duration', 3, 1)
        .setTooltip('速度持续多长时间')
    );
}

extend('MechanicStatus', 'Component');
function MechanicStatus()
{
    this.super('Status', Type.MECHANIC, false);
    
    this.description = '对目标造成状态效果';
    
    this.data.push(new ListValue('状态', 'status', [ 'Absorb', 'Curse', 'Disarm', 'Invincible', 'Root', 'Silence', 'Stun' ], 'Stun')
        .setTooltip('状态效果')
    );
    this.data.push(new AttributeValue('持续时间', 'duration', 3, 1)
        .setTooltip('状态效果持续多长时间')
    );
}

extend('MechanicTaunt', 'Component');
function MechanicTaunt()
{
    this.super('Taunt', Type.MECHANIC, false);
    
    this.description = '对敌对生物进行攻击，该效果只对较高版本的服务器适用';
}

extend('MechanicValueAdd', 'Component');
function MechanicValueAdd()
{
    this.super('Value Add', Type.MECHANIC, false);
    
    this.description = '添加施法者一个属性值 如果该值未设置，则将该值设置为给定量。';
    
    this.data.push(new StringValue('关键词', 'key', 'value')
        .setTooltip('存储数值的唯一关键词 该关键词可以用于代替属性值来使用存储的值')
    );
    this.data.push(new AttributeValue('数量', 'amount', 1, 0)
        .setTooltip('需要添加属性值的数量')
    );
}

extend('MechanicValueAttribute', 'Component');
function MechanicValueAttribute() 
{
    this.super('Value Attribute', Type.MECHANIC, false);
    
    this.description = '将特定属性的玩家的属性计数作为存储值加载到其他效果中。';
    
    this.data.push(new StringValue('关键词', 'key', 'attribute')
        .setTooltip('存储数值的唯一关键词 该关键词可以用于代替属性值来使用存储的值')
    );
    this.data.push(new StringValue('属性', 'attribute', 'Vitality')
        .setTooltip('作为存储值加载到其他效果中的属性的名称')
    );
}

extend('MechanicValueHealth', 'Component');
function MechanicValueHealth()
{
    this.super('Value Health', Type.MECHANIC, false);
    
    this.description = '将目标的当前血量存储为施法者的给定关键词下的值';
    
    this.data.push(new StringValue('关键词', 'key', 'value')
        .setTooltip('存储数值的唯一关键词 该关键词可以用于代替属性值来使用存储的值')
    );
}

extend('MechanicValueLocation', 'Component');
function MechanicValueLocation() 
{
    this.super('Value Location', Type.MECHANIC, false);
    
    this.description = '将第一个目标的当前位置加载到存储值以供稍后使用';
    
    this.data.push(new StringValue('关键词', 'key', 'location')
        .setTooltip('存储数值的唯一关键词 该关键词可以用于代替属性值来使用存储的值')
    );
}

extend('MechanicValueLore', 'Component');
function MechanicValueLore()
{
    this.super('Value Lore', Type.MECHANIC, false);
    
    this.description = '将持有的物品的lore加载到一个给定的属性的存储值';
    
    this.data.push(new StringValue('关键词', 'key', 'lore')
        .setTooltip('存储数值的唯一关键词 该关键词可以用于代替属性值来使用存储的值')
    );
    this.data.push(new ListValue("手", "hand", [ 'Main', 'Offhand' ], 'Main')
        .setTooltip('检查手中的物品 分别为：主手 副手 副手物品只在1.9+的版本适用')
    );
    this.data.push(new StringValue('正则表达式', 'regex', 'Damage: {value}')
        .setTooltip('要查找的正则表达式字符串，使用{value}作为存储的数字 如果您不知道正则表达式，请考虑在维基百科上查找，或避免使用主要字符（如[] {}（））。 +？ * ^ \\ |')
    );
    this.data.push(new AttributeValue('乘数', 'multiplier', 1, 0)
        .setTooltip('获得价值的乘数 如果您希望该值保持不变，请将此值保留为1')
    );
}

extend('MechanicValueLoreSlot', 'Component');
function MechanicValueLoreSlot()
{
    this.super('Value Lore Slot', Type.MECHANIC, false);
    
    this.description = '将一个物品的lore加载到一个给定的属性的存储值';
    
    this.data.push(new StringValue('关键词', 'key', 'lore')
        .setTooltip('存储数值的唯一关键词 该关键词可以用于代替属性值来使用存储的值')
    );
    this.data.push(new IntValue("槽位", "slot", 9)
        .setTooltip('槽位的位置 0-8代表快捷栏 9-35代表物品栏 36-39是护甲栏 40是副手')
    );
    this.data.push(new StringValue('正则表达式', 'regex', 'Damage: {value}')
        .setTooltip('要查找的正则表达式字符串，使用{value}作为存储的数字 如果您不知道正则表达式，请考虑在维基百科上查找，或避免使用主要字符（如[] {}（））。 +？ * ^ \\ |')
    );
    this.data.push(new AttributeValue('乘数', 'multiplier', 1, 0)
        .setTooltip('获得价值的乘数 如果您希望该值保持不变，请将此值保留为1')
    );
}

extend('MechanicValueMana', 'Component');
function MechanicValueMana()
{
    this.super('Value Mana', Type.MECHANIC, false);
    
    this.description = '将目标的法力值加载到一个给定的属性的存储值';
    
    this.data.push(new StringValue('关键词', 'key', 'value')
        .setTooltip('存储数值的唯一关键词 该关键词可以用于代替属性值来使用存储的值')
    );
}

extend('MechanicValueMultiply', 'Component');
function MechanicValueMultiply()
{
    this.super('Value Multiply', Type.MECHANIC, false);
    
    this.description = '将一个关键词的存储值乘一个数 如果该值没有设置，这不会做任何事情';
    
    this.data.push(new StringValue('关键词', 'key', 'value')
        .setTooltip('存储数值的唯一关键词 该关键词可以用于代替属性值来使用存储的值')
    );
    this.data.push(new AttributeValue('乘数', 'multiplier', 1, 0)
        .setTooltip('需要乘的数')
    );
}

extend('MechanicValueRandom', 'Component')
function MechanicValueRandom()
{
    this.super('Value Random', Type.MECHANIC, false);
    
    this.description = '随机在施法者的关键词下存储指定的值。';
    
    this.data.push(new StringValue('关键词', 'key', 'value')
        .setTooltip('存储数值的唯一关键词 该关键词可以用于代替属性值来使用存储的值')
    );
    this.data.push(new ListValue('类型', 'type', [ 'Normal', 'Triangular' ], 'Normal')
        .setTooltip('随机使用的类型，分别为：随机 三角形 三角有利于中间的数字，类似于滚动的两个骰子')
    );
    this.data.push(new AttributeValue('最小', 'min', 0, 0)
        .setTooltip('可以被存储的最小值')
    );
    this.data.push(new AttributeValue('最大', 'max', 0, 0)
        .setTooltip('可以被存储的最大值')
    );
}

extend('MechanicValueSet', 'Component');
function MechanicValueSet()
{
    this.super('Value Set', Type.MECHANIC, false);
    
    this.description = '在施法者的关键词下存储指定的值。';
    
    this.data.push(new StringValue('关键词', 'key', 'value')
        .setTooltip('存储数值的唯一关键词 该关键词可以用于代替属性值来使用存储的值')
    );
    this.data.push(new AttributeValue('数值', 'value', 1, 0)
        .setTooltip('需要存储的数值')
    );
}

extend('MechanicWarp', 'Component');
function MechanicWarp()
{
    this.super('Warp', Type.MECHANIC, false);
    
    this.description = '相对于前进方向传送目标 使用负数进行相反的方向（例如，向前的向前会导致目标向后传送）';
    
    this.data.push(new ListValue('穿墙', 'walls', [ 'True', 'False' ], 'False')
        .setTooltip('传送能否语序穿墙')
    );
    this.data.push(new AttributeValue('向前距离', 'forward', 3, 1)
        .setTooltip('向前传送的距离，负数则向后传送')
    );
    this.data.push(new AttributeValue('向上距离', 'upward', 0, 0)
        .setTooltip('向上传送的距离，负数则向下传送')
    );
    this.data.push(new AttributeValue('向右距离', 'right', 0, 0)
        .setTooltip('向右传送的距离，负数则向左传送')
    );
}

extend('MechanicWarpLoc', 'Component');
function MechanicWarpLoc()
{
    this.super('Warp Location', Type.MECHANIC, false);
    
    this.description = '将目标传送到指定位置.';
    
    this.data.push(new StringValue('世界名称 (或 "current")', 'world', 'current')
        .setTooltip('像传送到的世界的名称 "current"为"当前世界"')
    );
    this.data.push(new DoubleValue('X', 'x', 0)
        .setTooltip('所需位置的X坐标')
    );
    this.data.push(new DoubleValue('Y', 'y', 0)
        .setTooltip('所需位置的Y坐标')
    );
    this.data.push(new DoubleValue('Z', 'z', 0)
        .setTooltip('所需位置的Z坐标')
    );
    this.data.push(new DoubleValue('偏差', 'yaw', 0)
        .setTooltip('所需位置的偏差（左/右方向）')
    );
    this.data.push(new DoubleValue('间距', 'pitch', 0)
        .setTooltip('所需位置的间距（上/下方向）')
    );
}

extend('MechanicWarpRandom', 'Component');
function MechanicWarpRandom()
{
    this.super('Warp Random', Type.MECHANIC, false);
    
    this.description = '将目标以随机方向传送';
    
    this.data.push(new ListValue('只有水平方向', 'horizontal', [ 'True', 'False' ], 'True')
        .setTooltip('是否只允许水平方向传送')
    );
    this.data.push(new ListValue('穿墙', 'walls', [ 'True', 'False' ], 'False')
        .setTooltip('是否允许穿墙')
    );
    this.data.push(new AttributeValue('距离', 'distance', 3, 1)
        .setTooltip('最大传送距离')
    );
}

extend('MechanicWarpSwap', 'Component');
function MechanicWarpSwap()
{
    this.super('Warp Swap', Type.MECHANIC, false);
    
    this.description = '切换施法者和目标的位置 如果提供多个目标，则选取第一个目标。';
}

extend('MechanicWarpTarget', 'Component');
function MechanicWarpTarget()
{
    this.super('Warp Target', Type.MECHANIC, false);
    
    this.description = '将目标或施法者传送到对方 当目标是施法者时，不会做任何事情。';
    
    this.data.push(new ListValue('类型', 'type', [ 'Caster to Target', 'Target to Caster' ], 'Caster to Target')
        .setTooltip('传送的类型，分别为施法者传送到目标 目标传送到施法者')
    );
}

extend('MechanicWarpValue', 'Component');
function MechanicWarpValue() 
{
    this.super('Warp Value', Type.MECHANIC, false);
    
    this.description = '将所有目标传送到使用“关键词”机制标记的位置。';
    
    this.data.push(new StringValue('关键词', 'key', 'location')
        .setTooltip('存储数值的唯一关键词 该关键词可以用于代替属性值来使用存储的值')
    );
}

extend('MechanicWolf', 'Component');
function MechanicWolf()
{
    this.super('Wolf', Type.MECHANIC, true);
    
    this.description = '在每个目标处召唤若干只狼一段时间 子组件将开始针对狼，以便添加效果。 你也可以给它自己的技能，虽然Cast触发器不会发生';
    
    this.data.push(new ListValue('项圈颜色', 'color', dyeList, 'Black')
        .setTooltip('狼项圈的颜色')
    );
    this.data.push(new StringValue('狼名字', 'name', "{player}'s Wolf")
        .setTooltip('狼显示的名字 用{player}替代玩家名字')
    );
    this.data.push(new AttributeValue('血量', 'health', 10, 0)
        .setTooltip('狼的初始血量')
    );
    this.data.push(new AttributeValue('伤害', 'damage', 3, 0)
        .setTooltip('狼每次攻击造成的伤害')
    );
    this.data.push(new AttributeValue('持续时间', 'seconds', 10, 0)
        .setTooltip('狼持续的时间')
    );
    this.data.push(new AttributeValue('数量', 'amount', 1, 0)
        .setTooltip('召唤狼的数量')
    );
    this.data.push(new StringListValue('技能 一个一行', 'skills', [])
        .setTooltip('给狼的技能 技能是在召唤狼的技能前提下执行的 需要Cast触发器的技能将无法正常工作。')
    );
}

// The active component being edited or added to
var activeComponent = undefined;

/**
 * Adds the options for item related effects to the component
 *
 * @param {Component} component - the component to add to
 */
function addItemOptions(component) {
    
    component.data.push(new ListValue('物品的形状', 'check-mat', [ 'True', 'False' ], 'True')
        .setTooltip('物品是否需要有一个正确的形状')
    );
    component.data.push(new ListValue('形状', 'material', materialList, 'Arrow')
        .requireValue('check-mat', [ 'True' ])
        .setTooltip('材料所需的形状')
    );
    
    component.data.push(new ListValue('物品的数据', 'check-data', [ 'True', 'False' ], 'False')
        .setTooltip('物品是否需要一个正确的数据值')
    );
    component.data.push(new IntValue('数据', 'data', 0)
        .requireValue('check-data', [ 'True' ])
        .setTooltip('物品所需的数据值')
    );
    
    component.data.push(new ListValue('物品的lore', 'check-lore', [ 'True', 'False' ], 'False')
        .setTooltip('物品是否需要一个正确的lore')
    );
    component.data.push(new StringValue('Lore', 'lore', 'text')
        .requireValue('check-lore', [ 'True' ])
        .setTooltip('物品所需的lore')
    );
    
    component.data.push(new ListValue('物品显示的名字', 'check-name', [ 'True', 'False' ], 'False')
        .setTooltip('物品是否需要一个正确的显示的名字')
    );
    component.data.push(new StringValue('名字', 'name', 'name')
        .requireValue('check-name', [ 'True' ])
        .setTooltip('物品所需显示的名字')
    );
    
    component.data.push(new ListValue('正则表达式', 'regex', [ 'True', 'False' ], 'False')
        .setTooltip('物品的名字和lore是否需要被正则表达式所检索，如果你不知道什么是正则表达式，别动这个选项，将它调为false')
    );
}

function addProjectileOptions(component) {
    
    // General data
    component.data.push(new ListValue("群组", "group", ["Ally", "Enemy"], "Enemy")
        .setTooltip('目标的群组 分别为：盟友 敌人')
    );
    component.data.push(new ListValue('路线', 'spread', [ 'Cone', 'Horizontal Cone', 'Rain' ], 'Cone')
        .setTooltip('物品移动的路线，分别为：抛物线 直线 天降正义 |抛物线像箭一样 直线平行于地面 天降正义，顾名思义')
    );
    component.data.push(new AttributeValue('数量', 'amount', 1, 0)
        .setTooltip('抛射物的数量')
    );
    component.data.push(new AttributeValue('速度', 'velocity', 3, 0)
        .setTooltip('抛射物发射的速度 负值则以相反方向发射')
    );
    
    // Cone values
    component.data.push(new AttributeValue('偏离', 'angle', 30, 0)
        .requireValue('spread', [ 'Cone', 'Horizontal Cone' ])
        .setTooltip('抛射物每枚偏离的角度（像枪械的后坐力），如果你只是射击一枚抛射物，这没关系')
    );
    component.data.push(new DoubleValue('高度', 'position', 0, 0)
        .requireValue('spread', [ 'Cone', 'Horizontal Cone' ])
        .setTooltip('抛射物起始位置与地面的距离')
    );
    
    // Rain values
    component.data.push(new AttributeValue('高度', 'height', 8, 0)
        .requireValue('spread', [ 'Rain' ])
        .setTooltip('抛射物起始位置与地面的距离')
    );
    component.data.push(new AttributeValue('半径', 'rain-radius', 2, 0)
        .requireValue('spread', [ 'Rain' ])
        .setTooltip('天降正义的半径')
    );
    
    // Offsets
    component.data.push(new AttributeValue('向前偏移', 'forward', 0, 0)
        .setTooltip('炮弹将会在目标前方多远时引爆，负数则后方')
    );
    component.data.push(new AttributeValue('向上偏移', 'upward', 0, 0)
        .setTooltip('炮弹将会在目标上方多远时引爆，负数则下方')
    );
    component.data.push(new AttributeValue('向右偏移', 'right', 0, 0)
        .setTooltip('炮弹将会在目标右方多远时引爆，负数则左方')
    );
}

/**
 * Adds the options for particle effects to the components
 *
 * @param {Component} component - the component to add to
 */
function addParticleOptions(component) {
    component.data.push(new ListValue('粒子', 'particle', 
        [ 
            'Angry Villager', 
            'Barrier',
            'Block Crack', 
            'Bubble', 
            'Cloud', 
            'Crit', 
            'Damage Indicator',
            'Death', 
            'Death Suspend', 
            'Dragon Breath',
            'Drip Lava', 
            'Drip Water', 
            'Enchantment Table', 
            'End Rod',
            'Ender Signal', 
            'Explode', 
            'Firework Spark', 
            'Flame', 
            'Footstep', 
            'Happy Villager', 
            'Heart', 
            'Huge Explosion', 
            'Hurt', 
            'Icon Crack', 
            'Instant Spell', 
            'Large Explode', 
            'Large Smoke', 
            'Lava', 
            'Magic Crit', 
            'Mob Spell', 
            'Mob Spell Ambient', 
            'Mobspawner Flames', 
            'Note', 
            'Portal', 
            'Potion Break', 
            'Red Dust', 
            'Sheep Eat', 
            'Slime', 
            'Smoke', 
            'Snowball Poof', 
            'Snow Shovel', 
            'Spell', 
            'Splash', 
            'Sweep Attack',
            'Suspend', 
            'Town Aura', 
            'Water Drop',
            'Water Wake',
            'Witch Magic', 
            'Wolf Hearts', 
            'Wolf Shake', 
            'Wolf Smoke' 
        ], 'Angry Villager')
        .setTooltip('要显示的粒子类型，显示DX，DY和DZ选项的粒子效果与Cauldron服务端不兼容')
    );
    
    component.data.push(new ListValue('材质', 'material', materialList, 'Dirt').requireValue('particle', [ 'Block Crack', 'Icon Crack' ])
        .setTooltip('使用何种材质，分别为：使用方块材质或图标材质')
    );
    component.data.push(new IntValue('类', 'type', 0).requireValue('particle', [ 'Block Crack', 'Icon Crack' ])
        .setTooltip('方块或图标材质的数据值')
    );
    
    component.data.push(new ListValue('布置', 'arrangement', [ 'Circle', 'Hemisphere', 'Sphere' ], 'Circle')
        .setTooltip('用于颗粒的布置 Circle是一个2D圆，Hemisphere是一半的3D球体，Sphere是一个3D球体')
    );
    component.data.push(new AttributeValue('半径', 'radius', 4, 0)
        .setTooltip('方块布置的半径')
    );
    component.data.push(new AttributeValue('粒子', 'particles', 20, 0)
        .setTooltip('释放粒子的数量')
    );
    
    // Circle arrangement direction
    component.data.push(new ListValue('圈的的方向', 'direction', [ 'XY', 'XZ', 'YZ' ], 'XZ').requireValue('arrangement', [ 'Circle' ])
        .setTooltip('圈的方向 XY和YZ是垂直圈，XZ是水平圈。')
    );
    
    // Bukkit particle data value
    component.data.push(new IntValue('数据', 'data', 0).requireValue('particle', [ 'Smoke', 'Ender Signal', 'Mobspawner Flames', 'Potion Break' ])
        .setTooltip('粒子所用的数据，分别为：烟 末影颗粒 刷怪笼的火焰 药水颗粒')
    );
    
    // Reflection particle data
    var reflectList = [ 'Angry Villager', 'Bubble', 'Cloud', 'Crit', 'Damage Indicator', 'Death Suspend', 'Dragon Breath', 'Drip Lava', 'Drip Water', 'Enchantment Table', 'End Rod', 'Explode', 'Fireworks Spark', 'Flame', 'Footstep', 'Happy Villager', 'Hear', 'Huge Explosion', 'Instant Spell', 'Large Explode', 'Large Smoke', 'Lava', 'Magic Crit', 'Mob Spell', 'Mob Spell Ambient', 'Note', 'Portal', 'Red Dust', 'Slime', 'Snowball Poof', 'Snow Shovel', 'Spell', 'Splash', 'Suspend', 'Sweep Attack', 'Town Aura', 'Water Drop', 'Water Wake', 'Witch Magic' ];
    component.data.push(new IntValue('可见半径', 'visible-radius', 25).requireValue('particle', reflectList)
        .setTooltip('多远能看见此粒子效果')
    );
    component.data.push(new DoubleValue('DX', 'dx', 0).requireValue('particle', reflectList)
        .setTooltip('粒子之间变化的数据量， 它通常用于从颗粒在X方向上移动的距离')
    );
    component.data.push(new DoubleValue('DY', 'dy', 0).requireValue('particle', reflectList)
        .setTooltip('粒子之间变化的数据量， 它通常用于从颗粒在Y方向上移动的距离')
    );
    component.data.push(new DoubleValue('DZ', 'dz', 0).requireValue('particle', reflectList)
        .setTooltip('粒子之间变化的数据量， 它通常用于从颗粒在Z方向上移动的距离')
    );
    component.data.push(new DoubleValue('粒子速度', 'speed', 1).requireValue('particle', reflectList)
        .setTooltip('粒子之间变化的数据量，它通常用于控制颗粒的速度')
    );
    component.data.push(new DoubleValue('Packet Amount', 'amount', 1).requireValue('particle', reflectList)
        .setTooltip('粒子之间变化的数据量，设置为0可以控制一些粒子的颜色。')
    );
}

function addEffectOptions(component, optional)
{
    var opt = appendNone;
    if (optional)
    {
        opt = appendOptional;
        
        component.data.push(new ListValue('使用粒子效果（前方高能）', 'use-effect', [ 'True', 'False' ], 'False')
            .setTooltip('是否使用粒子效果，仅限付费版使用')
        );
    }
    
    component.data.push(opt(new StringValue('效果关键词', 'effect-key', 'default')
        .setTooltip('效果的关键词，每个关键词在同一个粒子效果中只能出现一次')
    ));
    component.data.push(opt(new AttributeValue('持续时间', 'duration', 1, 0)
        .setTooltip('粒子效果持续的时间')
    ));
    
    component.data.push(opt(new StringValue('形状', '-shape', 'hexagon')
        .setTooltip('决定粒子每次迭代的方法的关键 查看“effects.yml”以获取已定义公式及关键词的列表')
    ));
    component.data.push(opt(new ListValue('形状方向', '-shape-dir', [ 'XY', 'YZ', 'XZ' ], 'XY')
        .setTooltip('适用于平面形状公式，XZ将是平的，另外两个是垂直的')
    ));
    component.data.push(opt(new StringValue('形状尺寸', '-shape-size', '1')
        .setTooltip('用于决定形状大小的公式 这可以是任何使用wiki中定义的操作的公式')
    ));
    component.data.push(opt(new StringValue('动画', '-animation', 'circle')
        .setTooltip('用于决定粒子效果相对于目标移动的公式的关键词 查看“effects.yml”以获取已定义公式及关键词的列表')
    ));
    component.data.push(opt(new ListValue('动画方向', '-anim-dir', [ 'XY', 'YZ', 'XZ' ], 'XZ')
        .setTooltip('像飞机一样的动画，XZ是平的')
    ));
    component.data.push(opt(new StringValue('动画尺寸', '-anim-size', '1')
        .setTooltip('决定动画距离乘数的公式 这可以是任何使用wiki中定义的操作的公式')
    ));
    component.data.push(opt(new IntValue('间隔', '-interval', 1)
        .setTooltip('播放粒子的间隔，单位是刻 20刻=1s')
    ));
    component.data.push(opt(new IntValue('查看范围', '-view-range', 25)
        .setTooltip('多远能看到这个粒子效果')
    ));
    
    component.data.push(opt(new ListValue('特效种类', '-particle-type', [
            'BARRIER',
            'BLOCK_CRACK',
            'CLOUD',
            'CRIT',
            'CRIT_MAGIC',
            'DAMAGE_INDICATOR',
            'DRAGON_BREATH',
            'DRIP_LAVA',
            'DRIP_WATER',
            'ENCHANTMENT_TABLE',
            'END_ROD',
            'EXPLOSION_HUGE',
            'EXPLOSION_LARGE',
            'EXPLOSION_NORMAL',
            'FIREWORKS_SPARK',
            'FLAME',
            'FOOTSTEP',
            'HEART',
            'LAVA',
            'MOB_APPEARANCE',
            'NOTE',
            'PORTAL',
            'REDSTONE',
            'SLIME',
            'SMOKE_NORMAL',
            'SMOKE_LARGE',
            'SNOWBALL',
            'SNOW_SHOVEL',
            'SPELL',
            'SPELL_INSTANT',
            'SPELL_MOB',
            'SPELL_MOB_AMBIENT',
            'SPELL_WITCH',
            'SUSPEND_DEPTH',
            'SUSPENDED',
            'SWEEP_ATTACK',
            'TOWN_AURA',
            'VILLAGER_ANGRY',
            'VILLAGER_HAPPY',
            'WATER_BUBBLE',
            'WATER_SPLASH',
            'WATER_WAKE'
        ], 'BARRIER')
        .setTooltip('使用特效的种类')
    ));
    component.data.push(opt(new ListValue('粒子材料', '-particle-material', materialList, 'WOOD')
        .requireValue('-particle-type', [ 'BLOCK_CRACK' ])
        .setTooltip('使用粒子的材料')
    ));
    component.data.push(opt(new IntValue('粒子数据', '-particle-data', 0)
        .requireValue('-particle-type', [ 'BLOCK_CRACK' ])
        .setTooltip('粒子的数据值')
    ));
    component.data.push(opt(new IntValue('粒子数', '-particle-amount', 0)
        .setTooltip('粒子的整数数量')
    ));
    component.data.push(opt(new DoubleValue('DX', '-particle-dx', 0)
        .setTooltip('粒子DX值，经常用于颜色')
    ));
    component.data.push(opt(new DoubleValue('DY', '-particle-dy', 0)
        .setTooltip('粒子DY值，经常用于颜色')
    ));
    component.data.push(opt(new DoubleValue('DZ', '-particle-dz', 0)
        .setTooltip('粒子DZ值，经常用于颜色')
    ));
    component.data.push(opt(new DoubleValue('速度', '-particle-speed', 1)
        .setTooltip('粒子的速度值，有时与速度有关')
    ));
}

function appendOptional(value)
{
    value.requireValue('use-effect', [ 'True' ]);
    return value;
}

function appendNone(value)
{
    return value;
}
