<frontmatter title="Table Rendering" />

# Table Rendering: Tbody Variants

<box type="info">
This page tests how MarkBind renders tables with and without &lt;tbody&gt; tags.
</box>

<panel header="Correct Table (With &lt;tbody&gt;)">
<table>
  <tbody>
    <tr>
      <td>Planning for next version</td>
    </tr>
  </tbody>
</table>
</panel>

<panel header="Table Without &lt;tbody&gt;">
<table>
  <tr>
    <td>Planning for next version</td>
  </tr>
</table>
</panel>

<panel header="Full Table with Headers + Tbody">
<table>
  <tbody>
    <tr>
      <th>Task ID</th>
      <th>Task</th>
      <th>Estimated Effort</th>
      <th>Prerequisite Task</th>
    </tr>
    <tr>
      <td>E</td>
      <td>Planning for next version</td>
      <td>1 man day</td>
      <td>D</td>
    </tr>
  </tbody>
</table>
</panel>
