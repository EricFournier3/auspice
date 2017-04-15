import React from "react";
import Radium from "radium";
import { connect } from "react-redux";
import {updateVisibility, updateBranchThickness} from "../../actions/treeProperties";

const $ = require('jquery');
$.DataTable = require('datatables.net');

@Radium
@connect((state) => ({nodes: state.tree.nodes}))
class Table extends React.Component {
    componentDidMount() {
        if (this.props.nodes){
          console.log(this.props.nodes.filter(function(d) {return d.is_terminal;}).map(function(d){return d.attr;}));
        }else{
          console.log("no nodes");
        }
    }

    componentWillReceiveProps(nextProps){
        if (nextProps.nodes){
          const tipAttrs = nextProps.nodes.filter(function(d){return d.attr['strain'];}).map(function(d){return d.attr;});
          console.log("table:", tipAttrs);
          this.makeTable(nextProps.nodes);
        }else{
          console.log("no nodes");
        }
    }

    componentDidRecieveProps()
    {
      this.makeTable(this.nodes.props);
    }

    componentWillUnmount(){
       $('.data-table-wrapper')
       .find('table')
       .DataTable()
       .destroy(true);
    }

    shouldComponentUpdate() {
      if (this.props.nodes){
        this.makeTable(this.props.nodes);
      }
      return false;
    }

    makeTable(nodes){
        const tipAttrs = nodes.filter(function(d){return d.attr['strain'];}).map(function(d){return d.attr;});
        const columns = [];
        for (let k in tipAttrs[0]){
          columns.push({name:k, width:60, data:k, visible:((k==="strain")||(k==="authors")||(k==="country"))?true:false});
        }
        console.log("columns", columns);
        $(this.refs.main).DataTable({
           dom: '<"data-table-wrapper">',
           data: tipAttrs,
           columns,
           ordering: false
        });
        console.log("made table");
    }

    reloadTableData(names) {
      const tipAttrs = this.props.nodes.filter(function(d){return d.attr['strain'];}).map(function(d){return d.attr;});
      const table = $('.data-table-wrapper')
                    .find('table')
                    .DataTable();
      table.clear();
      table.rows.add(tipAttrs);
      table.draw();
   }

   search(val){
    console.log("trigger search", val);
    const table = $(this.refs.main).DataTable();
    table.search(val).draw();
    const selectedItems = table.rows({search:"applied"}).data();
    const selectedStrains ={};
    selectedItems.each(function(virus,ii){
      selectedStrains[virus.strain]=true;
    });
    const selectedTips = this.props.nodes.map(function(d){
      return selectedStrains[d.attr.strain]?"visible":"hidden";
    });
    // console.log(selectedTips);
    this.props.dispatch(updateVisibility(selectedTips));
    this.props.dispatch(updateBranchThickness());
   }

   //search
   //dispatch vector with existing tips

    render() {
        console.log("rendering table");
        return (
            <div>
                <input type="text" placeholder="Search"
                    onChange={(e) => this.search(e.target.value)}
                />
                <table ref="main" />
            </div>);
    }
}


export default Table;