Attribute VB_Name = "Module1"
Option Explicit

Private Const NODE_SHAPE_PREFIX As String = "node_"
Private Const EDGE_GAP As Double = 8                  ' ノード縁と矢印端のすき間
Private Const EXTERNAL_LINE_WEIGHT As Double = 5      ' 圏外矢印の線幅
Private Const INTERNAL_LINE_WEIGHT As Double = 1.5    ' 内部矢印の線幅
Private Const EXTERNAL_EXTRA_LEN As Double = 8        ' 圏外矢印を少し伸ばす長さ

' クリック選択中のノード図形名（空=未選択）
Private selectedNodeName As String
' Open / Enable Content の二重起動防止
Private autoDrawDone As Boolean

' ブック起動時（マクロ有効化含む）に自動描画を予約する
Public Sub Auto_Open()
    Call ScheduleAutoDraw
End Sub

' OnTime で描画を1回予約する（Auto_Open から呼ぶ）
Public Sub ScheduleAutoDraw()
    On Error Resume Next
    Application.OnTime Now + TimeSerial(0, 0, 0), "AutoDrawMandalaChart"
    On Error GoTo 0
End Sub

' 予約された自動描画の本体（二重実行しない）
Public Sub AutoDrawMandalaChart()
    If autoDrawDone Then Exit Sub
    autoDrawDone = True
    Call DrawMandalaChart
End Sub

' Data/Node/Edge を読んで Chart に曼荼羅を描き直す
Public Sub DrawMandalaChart()
    Dim wsData As Worksheet
    Dim wsNode As Worksheet
    Dim wsEdge As Worksheet
    Dim wsChart As Worksheet
    On Error GoTo Fail

    selectedNodeName = ""

    Set wsData = ThisWorkbook.Worksheets("Data")
    Set wsNode = ThisWorkbook.Worksheets("Node")
    Set wsEdge = ThisWorkbook.Worksheets("Edge")
    Set wsChart = ThisWorkbook.Worksheets("Chart")

    Call ClearChartShapes(wsChart)
    Call DrawNodes(wsData, wsNode, wsChart)
    Call DrawEdges(wsEdge, wsChart)
    Call BringNodeShapesToFront(wsChart)

    wsChart.Activate
    Exit Sub
Fail:
    MsgBox "DrawMandalaChart でエラー: " & Err.Description & " (" & Err.Number & ")", vbCritical, "曼荼羅チャート"
End Sub

' ノードクリック: 流入/流出の色分け（再クリックで解除）
Public Sub OnNodeShapeClick()
    Dim wsChart As Worksheet
    Dim shpName As String
    On Error GoTo Fail

    shpName = CStr(Application.Caller)
    If Left$(shpName, Len(NODE_SHAPE_PREFIX)) <> NODE_SHAPE_PREFIX Then Exit Sub
    Set wsChart = ThisWorkbook.Worksheets("Chart")

    If selectedNodeName = shpName Then
        Call ResetAllVisualStyles(wsChart)
        selectedNodeName = ""
        Exit Sub
    End If

    Call ApplyFlowFocus(wsChart, shpName)
    selectedNodeName = shpName
    Exit Sub
Fail:
End Sub

' Chart 上の図形をすべて消す
Private Sub ClearChartShapes(ByVal ws As Worksheet)
    Dim i As Long
    For i = ws.Shapes.Count To 1 Step -1
        ws.Shapes(i).Delete
    Next i
End Sub

' ノードを矢印より前面に出す
Private Sub BringNodeShapesToFront(ByVal ws As Worksheet)
    Dim shp As Shape
    For Each shp In ws.Shapes
        If Left$(shp.Name, Len(NODE_SHAPE_PREFIX)) = NODE_SHAPE_PREFIX Then
            shp.ZOrder msoBringToFront
        End If
    Next shp
End Sub

' Data シートから key に対応する数値を読む
Private Function MetaNumber(ByVal ws As Worksheet, ByVal key As String) As Double
    Dim r As Long
    For r = 2 To 20
        If CStr(ws.Cells(r, 1).Value) = key Then
            MetaNumber = CDbl(ws.Cells(r, 2).Value)
            Exit Function
        End If
    Next r
    MetaNumber = 0
End Function

' ノードIDを Excel 図形名に使える文字へ変換する
Private Function SafeShapeName(ByVal nodeId As String) As String
    Dim s As String
    Dim i As Long
    Dim ch As String
    s = nodeId
    s = Replace(s, "-", "_")
    s = Replace(s, " ", "_")
    s = Replace(s, ".", "_")
    For i = 1 To Len(s)
        ch = Mid$(s, i, 1)
        If ch Like "[0-9A-Za-z_]" Then
            SafeShapeName = SafeShapeName & ch
        Else
            SafeShapeName = SafeShapeName & "_"
        End If
    Next i
    If Len(SafeShapeName) = 0 Then SafeShapeName = "node"
    SafeShapeName = NODE_SHAPE_PREFIX & SafeShapeName
End Function

' "RRGGBB" を Excel の RGB Long にする
Private Function RgbOf(ByVal hexRgb As String) As Long
    RgbOf = RGB(CLng("&H" & Mid$(hexRgb, 1, 2)), CLng("&H" & Mid$(hexRgb, 3, 2)), CLng("&H" & Mid$(hexRgb, 5, 2)))
End Function

' ノード通常色
Private Sub StyleNodeNormal(ByVal shp As Shape)
    shp.Fill.ForeColor.RGB = RgbOf("3d7fa8")
    shp.Line.ForeColor.RGB = RgbOf("9fd0ef")
    shp.Line.Weight = 1
    shp.Fill.Transparency = 0
End Sub

' 選択中ノード色（増減で緑/赤）
Private Sub StyleNodeFocus(ByVal shp As Shape, ByVal isUp As Boolean)
    If isUp Then
        shp.Fill.ForeColor.RGB = RgbOf("3f8d52")
    Else
        shp.Fill.ForeColor.RGB = RgbOf("b85656")
    End If
    shp.Line.ForeColor.RGB = RgbOf("f1d16f")
    shp.Line.Weight = 6
    shp.Fill.Transparency = 0
End Sub

' 選択ノードとつながる関連ノード色
Private Sub StyleNodeRelated(ByVal shp As Shape, ByVal isUp As Boolean)
    If isUp Then
        shp.Fill.ForeColor.RGB = RgbOf("3f8d52")
        shp.Line.ForeColor.RGB = RgbOf("9ad89a")
    Else
        shp.Fill.ForeColor.RGB = RgbOf("b85656")
        shp.Line.ForeColor.RGB = RgbOf("e6a3a3")
    End If
    shp.Line.Weight = 2
    shp.Fill.Transparency = 0
End Sub

' フォーカス外ノードを薄くする
Private Sub StyleNodeFaded(ByVal shp As Shape)
    shp.Fill.ForeColor.RGB = RgbOf("6f7782")
    shp.Line.ForeColor.RGB = RGB(0, 0, 0)
    shp.Line.Weight = 6
    shp.Fill.Transparency = 0
End Sub

' 矢印の通常色（内部/圏外・muted）
Private Sub StyleConnectorDefault(ByVal conn As Shape, ByVal kind As String, ByVal muted As Boolean)
    If kind = "external" Then
        If muted Then
            conn.Line.ForeColor.RGB = RgbOf("6a737a")
        Else
            conn.Line.ForeColor.RGB = RgbOf("9ed9ff")
        End If
        conn.Line.Weight = EXTERNAL_LINE_WEIGHT
    Else
        If muted Then
            conn.Line.ForeColor.RGB = RgbOf("6a737a")
        Else
            conn.Line.ForeColor.RGB = RgbOf("5b9fd4")
        End If
        conn.Line.Weight = INTERNAL_LINE_WEIGHT
    End If
    conn.Line.Transparency = IIf(muted, 0.45, 0)
End Sub

' 流入=緑 / 流出=赤
Private Sub StyleConnectorFlow(ByVal conn As Shape, ByVal isIncoming As Boolean)
    If isIncoming Then
        conn.Line.ForeColor.RGB = RgbOf("8ff5ab")
    Else
        conn.Line.ForeColor.RGB = RgbOf("ff8f8f")
    End If
    conn.Line.Transparency = 0.05
End Sub

' フォーカス外の矢印を薄くする
Private Sub StyleConnectorFaded(ByVal conn As Shape)
    conn.Line.Transparency = 0.82
End Sub

' 全図形の見た目を初期状態に戻す
Private Sub ResetAllVisualStyles(ByVal wsChart As Worksheet)
    Dim shp As Shape
    Dim parts() As String
    For Each shp In wsChart.Shapes
        If Left$(shp.Name, Len(NODE_SHAPE_PREFIX)) = NODE_SHAPE_PREFIX Then
            Call StyleNodeNormal(shp)
        ElseIf Left$(shp.Name, 5) = "edge_" Then
            parts = Split(shp.AlternativeText, "|")
            If UBound(parts) >= 3 Then
                Call StyleConnectorDefault(shp, parts(2), parts(3) = "1")
            End If
        End If
    Next shp
End Sub

' 前期→当期が増えているか（色分け用）
Private Function NodeIsUp(ByVal wsNode As Worksheet, ByVal nodeId As String) As Boolean
    Dim r As Long
    NodeIsUp = True
    r = 2
    Do While Len(CStr(wsNode.Cells(r, 1).Value)) > 0
        If CStr(wsNode.Cells(r, 1).Value) = nodeId Then
            NodeIsUp = (CDbl(wsNode.Cells(r, 4).Value) >= CDbl(wsNode.Cells(r, 3).Value))
            Exit Function
        End If
        r = r + 1
    Loop
End Function

' 選択ノード基準で流入/流出・関連ノードを色分けする
Private Sub ApplyFlowFocus(ByVal wsChart As Worksheet, ByVal focusShapeName As String)
    Dim wsNode As Worksheet
    Dim focusId As String
    Dim shp As Shape
    Dim nodeId As String
    Dim related As Object
    Dim parts() As String
    Dim fromId As String
    Dim toId As String

    Set wsNode = ThisWorkbook.Worksheets("Node")
    Set related = CreateObject("Scripting.Dictionary")

    On Error Resume Next
    focusId = wsChart.Shapes(focusShapeName).AlternativeText
    On Error GoTo 0
    If Len(focusId) = 0 Then Exit Sub

    For Each shp In wsChart.Shapes
        If Left$(shp.Name, 5) = "edge_" Then
            parts = Split(shp.AlternativeText, "|")
            If UBound(parts) >= 1 Then
                fromId = parts(0)
                toId = parts(1)
                If toId = focusId And Left$(fromId, 10) <> "ext-ghost-" Then
                    related(fromId) = True
                ElseIf fromId = focusId And Left$(toId, 10) <> "ext-ghost-" Then
                    related(toId) = True
                End If
            End If
        End If
    Next shp

    For Each shp In wsChart.Shapes
        If Left$(shp.Name, Len(NODE_SHAPE_PREFIX)) = NODE_SHAPE_PREFIX Then
            nodeId = shp.AlternativeText
            If nodeId = focusId Then
                Call StyleNodeFocus(shp, NodeIsUp(wsNode, nodeId))
            ElseIf related.Exists(nodeId) Then
                Call StyleNodeRelated(shp, NodeIsUp(wsNode, nodeId))
            Else
                Call StyleNodeFaded(shp)
            End If
        ElseIf Left$(shp.Name, 5) = "edge_" Then
            parts = Split(shp.AlternativeText, "|")
            If UBound(parts) >= 1 Then
                fromId = parts(0)
                toId = parts(1)
                If toId = focusId Then
                    Call StyleConnectorFlow(shp, True)
                ElseIf fromId = focusId Then
                    Call StyleConnectorFlow(shp, False)
                Else
                    Call StyleConnectorFaded(shp)
                End If
            End If
        End If
    Next shp
End Sub

' 楕円ノードに複数行ラベルを入れる
Private Sub ApplyNodeLabel(ByVal shp As Shape, ByVal labelText As String)
    On Error Resume Next
    With shp.TextFrame2
        .TextRange.Text = labelText
        .TextRange.Font.Size = 9
        .TextRange.Font.Fill.ForeColor.RGB = RGB(255, 255, 255)
        .VerticalAnchor = msoAnchorMiddle
        .TextRange.ParagraphFormat.Alignment = msoAlignCenter
    End With
    If Err.Number <> 0 Then
        Err.Clear
        With shp.TextFrame
            .Characters.Text = labelText
            .HorizontalAlignment = xlCenter
            .VerticalAlignment = xlCenter
            .Characters.Font.Size = 9
            .Characters.Font.Color = RGB(255, 255, 255)
        End With
    End If
    On Error GoTo 0
End Sub

' 改行より前の1行目だけ取る
Private Function FirstLine(ByVal text As String) As String
    Dim p As Long
    p = InStr(text, vbLf)
    If p = 0 Then p = InStr(text, vbCr)
    If p > 0 Then
        FirstLine = Trim$(Left$(text, p - 1))
    Else
        FirstLine = Trim$(text)
    End If
End Function

' ヒント用の件数表示（カンマ区切り）
Private Function FormatTipNumber(ByVal value As Double) As String
    FormatTipNumber = Format$(value, "#,##0")
End Function

' ノード表示名（ゴーストは「圏外」）
Private Function NodeDisplayName(ByVal wsNode As Worksheet, ByVal nodeId As String) As String
    Dim r As Long
    If Left$(nodeId, 10) = "ext-ghost-" Then
        ' 圏外
        NodeDisplayName = ChrW(&H570F) & ChrW(&H5916)
        Exit Function
    End If
    r = 2
    Do While Len(CStr(wsNode.Cells(r, 1).Value)) > 0
        If CStr(wsNode.Cells(r, 1).Value) = nodeId Then
            NodeDisplayName = FirstLine(CStr(wsNode.Cells(r, 2).Value))
            If Len(NodeDisplayName) = 0 Then NodeDisplayName = nodeId
            Exit Function
        End If
        r = r + 1
    Loop
    NodeDisplayName = nodeId
End Function

' 矢印ホバー用 ScreenTip 文言を作る
Private Function BuildEdgeScreenTip( _
    ByVal fromName As String, _
    ByVal toName As String, _
    ByVal value As Double, _
    ByVal kind As String _
) As String
    Dim tip As String
    Dim sep As String
    Dim label As String
    sep = " -> "
    If kind = "external" Then
        ' 圏外
        label = ChrW(&H570F) & ChrW(&H5916)
        tip = fromName & sep & toName & " | " & label & " " & FormatTipNumber(value)
    Else
        ' 件数
        label = ChrW(&H4EF6) & ChrW(&H6570)
        tip = fromName & sep & toName & " | " & label & " " & FormatTipNumber(value)
    End If
    BuildEdgeScreenTip = Left$(tip, 255)
End Function

' 矢印だけに ScreenTip を付ける（ノードには付けない）
Private Sub AttachEdgeScreenTip(ByVal ws As Worksheet, ByVal shp As Shape, ByVal tip As String)
    Dim h As Hyperlink
    On Error Resume Next
    Set h = ws.Hyperlinks.Add(Anchor:=shp, Address:="", SubAddress:="")
    If Not h Is Nothing Then
        h.ScreenTip = Left$(tip, 255)
    End If
    On Error GoTo 0
End Sub

' Node シートから楕円ノードを描く
Private Sub DrawNodes(ByVal wsData As Worksheet, ByVal wsNode As Worksheet, ByVal wsChart As Worksheet)
    Dim r As Long
    Dim nodeW As Double
    Dim nodeH As Double
    Dim id As String
    Dim shp As Shape

    nodeW = MetaNumber(wsData, "nodeWidth")
    nodeH = MetaNumber(wsData, "nodeHeight")
    If nodeW <= 0 Then nodeW = 168
    If nodeH <= 0 Then nodeH = 64

    r = 2
    Do While Len(CStr(wsNode.Cells(r, 1).Value)) > 0
        id = CStr(wsNode.Cells(r, 1).Value)
        Set shp = wsChart.Shapes.AddShape( _
            msoShapeOval, _
            CDbl(wsNode.Cells(r, 5).Value) - nodeW / 2, _
            CDbl(wsNode.Cells(r, 6).Value) - nodeH / 2, _
            nodeW, nodeH)
        shp.Name = SafeShapeName(id)
        shp.AlternativeText = id
        Call StyleNodeNormal(shp)
        Call ApplyNodeLabel(shp, CStr(wsNode.Cells(r, 2).Value))
        shp.OnAction = "'" & Replace(ThisWorkbook.Name, "'", "''") & "'!OnNodeShapeClick"
        r = r + 1
    Loop
End Sub

' ノードIDから図形を探す（無ければ Nothing）
Private Function GetNodeShape(ByVal wsChart As Worksheet, ByVal nodeId As String) As Shape
    On Error GoTo Missing
    Set GetNodeShape = wsChart.Shapes(SafeShapeName(nodeId))
    Exit Function
Missing:
    Set GetNodeShape = Nothing
End Function

' 矢印端を楕円の縁＋すき間まで引き寄せる
Private Sub PullToEllipse( _
    ByVal shp As Shape, _
    ByVal otherX As Double, _
    ByVal otherY As Double, _
    ByRef x As Double, _
    ByRef y As Double _
)
    Dim cx As Double
    Dim cy As Double
    Dim rx As Double
    Dim ry As Double
    Dim vx As Double
    Dim vy As Double
    Dim mag As Double
    Dim t As Double

    cx = shp.Left + shp.Width / 2
    cy = shp.Top + shp.Height / 2
    rx = shp.Width / 2
    ry = shp.Height / 2
    If rx <= 0 Or ry <= 0 Then Exit Sub

    vx = otherX - cx
    vy = otherY - cy
    mag = Sqr(vx * vx + vy * vy)
    If mag < 0.001 Then Exit Sub

    t = 1# / Sqr((vx / rx) ^ 2 + (vy / ry) ^ 2)
    x = cx + t * vx + EDGE_GAP * vx / mag
    y = cy + t * vy + EDGE_GAP * vy / mag
End Sub

' 圏外側の先端を少し外側へ伸ばす
Private Sub ExtendAway( _
    ByVal anchorX As Double, _
    ByVal anchorY As Double, _
    ByRef tipX As Double, _
    ByRef tipY As Double, _
    ByVal extra As Double _
)
    Dim vx As Double
    Dim vy As Double
    Dim mag As Double
    vx = tipX - anchorX
    vy = tipY - anchorY
    mag = Sqr(vx * vx + vy * vy)
    If mag < 0.001 Then Exit Sub
    tipX = tipX + extra * vx / mag
    tipY = tipY + extra * vy / mag
End Sub

' Edge シートから直線コネクタ（矢印）と件数ラベルを描く
Private Sub DrawEdges(ByVal wsEdge As Worksheet, ByVal wsChart As Worksheet)
    Dim wsNode As Worksheet
    Dim r As Long
    Dim fromId As String
    Dim toId As String
    Dim kind As String
    Dim x1 As Double, y1 As Double, x2 As Double, y2 As Double
    Dim fromShp As Shape
    Dim toShp As Shape
    Dim conn As Shape
    Dim labelText As String
    Dim isMuted As Boolean
    Dim edgeValue As Double
    Dim tip As String

    Set wsNode = ThisWorkbook.Worksheets("Node")

    r = 2
    Do While Len(CStr(wsEdge.Cells(r, 1).Value)) > 0
        fromId = CStr(wsEdge.Cells(r, 1).Value)
        toId = CStr(wsEdge.Cells(r, 2).Value)
        edgeValue = CDbl(wsEdge.Cells(r, 3).Value)
        isMuted = (CStr(wsEdge.Cells(r, 4).Value) = "1")
        kind = CStr(wsEdge.Cells(r, 5).Value)
        labelText = CStr(wsEdge.Cells(r, 6).Value)

        Set fromShp = GetNodeShape(wsChart, fromId)
        Set toShp = GetNodeShape(wsChart, toId)

        If kind = "external" Then
            x1 = CDbl(wsEdge.Cells(r, 7).Value)
            y1 = CDbl(wsEdge.Cells(r, 8).Value)
            x2 = CDbl(wsEdge.Cells(r, 9).Value)
            y2 = CDbl(wsEdge.Cells(r, 10).Value)
        Else
            If fromShp Is Nothing Or toShp Is Nothing Then GoTo NextEdge
            x1 = fromShp.Left + fromShp.Width / 2
            y1 = fromShp.Top + fromShp.Height / 2
            x2 = toShp.Left + toShp.Width / 2
            y2 = toShp.Top + toShp.Height / 2
        End If

        If Not fromShp Is Nothing Then Call PullToEllipse(fromShp, x2, y2, x1, y1)
        If Not toShp Is Nothing Then Call PullToEllipse(toShp, x1, y1, x2, y2)

        If kind = "external" Then
            If fromShp Is Nothing Then
                Call ExtendAway(x2, y2, x1, y1, EXTERNAL_EXTRA_LEN)
            ElseIf toShp Is Nothing Then
                Call ExtendAway(x1, y1, x2, y2, EXTERNAL_EXTRA_LEN)
            End If
        End If

        Set conn = wsChart.Shapes.AddConnector(msoConnectorStraight, x1, y1, x2, y2)
        conn.Name = "edge_" & CStr(r)
        conn.AlternativeText = fromId & "|" & toId & "|" & kind & "|" & IIf(isMuted, "1", "0")
        Call StyleConnectorDefault(conn, kind, isMuted)
        tip = BuildEdgeScreenTip( _
            NodeDisplayName(wsNode, fromId), _
            NodeDisplayName(wsNode, toId), _
            edgeValue, _
            kind)
        Call AttachEdgeScreenTip(wsChart, conn, tip)
        On Error Resume Next
        conn.Line.EndArrowheadStyle = msoArrowheadTriangle
        If kind = "external" Then
            conn.Line.EndArrowheadLength = msoArrowheadLengthMedium
            conn.Line.EndArrowheadWidth = msoArrowheadWide
        Else
            conn.Line.EndArrowheadLength = msoArrowheadLengthMedium
            conn.Line.EndArrowheadWidth = msoArrowheadWidthMedium
        End If
        On Error GoTo 0

        If Len(labelText) > 0 Then
            Dim lbl As Shape
            Set lbl = wsChart.Shapes.AddTextbox(msoTextOrientationHorizontal, (x1 + x2) / 2 + 18, (y1 + y2) / 2 - 6, 80, 14)
            On Error Resume Next
            lbl.TextFrame2.TextRange.Text = labelText
            lbl.TextFrame2.TextRange.Font.Size = 8
            If Err.Number <> 0 Then
                Err.Clear
                lbl.TextFrame.Characters.Text = labelText
                lbl.TextFrame.Characters.Font.Size = 8
            End If
            On Error GoTo 0
            lbl.Fill.Visible = msoFalse
            lbl.Line.Visible = msoFalse
        End If
NextEdge:
        r = r + 1
    Loop
End Sub
